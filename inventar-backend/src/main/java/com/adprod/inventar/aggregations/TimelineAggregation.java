package com.adprod.inventar.aggregations;

import com.adprod.inventar.models.Expense;
import com.adprod.inventar.models.Income;
import com.adprod.inventar.models.TimelineExpenseDTO;
import com.adprod.inventar.models.TimelineIncomeDTO;
import lombok.AllArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationExpression;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.Fields;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

@Service
@AllArgsConstructor
public class TimelineAggregation {

    private final MongoTemplate mongoTemplate;
    private final BaseAggregation baseAggregation;

    public List<TimelineExpenseDTO> expensesTimeline(Instant from, Instant to, String account, String range) {
        String dateFormat = bucketFormat(range);
        List<AggregationOperation> ops = baseAggregation.baseAggregation(from, to, account);
        ZoneId zoneId = ZoneId.systemDefault();

        ops.add(
                Aggregation
                        .project("moneySpent", "currency")
                        .andExpression("{$dateToString: { timezone: '" + zoneId.getId() + "', format: " + dateFormat + ", date: '$createdTime'}}").as("date")
        );
        ops.add(
                Aggregation.group(
                                Fields.fields()
                                        .and("date", "$date")
                                        .and("currency", "$currency"))
                        .sum(AggregationExpression.from(MongoExpression.create("$sum: '$moneySpent'")))
                        .as("dailyExpense"));
        // Flatten compound _id so clients get { _id: "<bucket>", currency: "<code>", dailyExpense }
        ops.add(ctx -> new Document(
                "$project",
                new Document("dailyExpense", 1)
                        .append("_id", "$_id.date")
                        .append("currency", "$_id.currency")));

        TypedAggregation<Expense> agg = Aggregation.newAggregation(Expense.class, ops);
        return mongoTemplate.aggregate(agg, "spending", TimelineExpenseDTO.class).getMappedResults();
    }

    public List<TimelineIncomeDTO> incomesTimeline(Instant from, Instant to, String account, String range) {
        String dateFormat = bucketFormat(range);
        List<AggregationOperation> ops = baseAggregation.baseAggregation(from, to, account);
        ZoneId zoneId = ZoneId.systemDefault();

        ops.add(
                Aggregation
                        .project("incoming", "currency")
                        .andExpression("{$dateToString: { timezone: '" + zoneId.getId() + "', format: " + dateFormat + ", date: '$createdTime'}}").as("date")
        );
        ops.add(
                Aggregation.group(
                                Fields.fields()
                                        .and("date", "$date")
                                        .and("currency", "$currency"))
                        .sum(AggregationExpression.from(MongoExpression.create("$sum: '$incoming'")))
                        .as("income"));
        ops.add(ctx -> new Document(
                "$project",
                new Document("income", 1)
                        .append("_id", "$_id.date")
                        .append("currency", "$_id.currency")));

        TypedAggregation<Income> agg = Aggregation.newAggregation(Income.class, ops);
        return mongoTemplate.aggregate(agg, "incomes", TimelineIncomeDTO.class).getMappedResults();
    }

    /**
     * Mongo $dateToString format token (already wrapped in single quotes for inline use)
     * for the requested range bucket:
     *   DAY    → hour of day            (00–23)
     *   WEEK   → ISO weekday            (1=Mon … 7=Sun)
     *   MONTH  → day of month           (01–31)
     *   YEAR   → month of year          (01–12)
     *   MAX    → year-month             (yyyy-MM)
     *   CUSTOM → full calendar day      (yyyy-MM-dd)
     * Anything else falls back to hour of day for safety.
     *
     * CUSTOM uses a fully-qualified date because the user-picked window can
     * straddle months — bucketing by day-of-month alone would collide
     * (e.g. May 31 and Jun 30 would both land in bucket "31"/"30").
     */
    private String bucketFormat(String range) {
        if (range == null) {
            return "'%H'";
        }
        switch (range) {
            case "WEEK":
                return "'%u'";
            case "MONTH":
                return "'%d'";
            case "YEAR":
                return "'%m'";
            case "MAX":
                return "'%Y-%m'";
            case "CUSTOM":
                return "'%Y-%m-%d'";
            case "DAY":
            default:
                return "'%H'";
        }
    }

}
