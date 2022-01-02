package com.adprod.inventar.services.implementations;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import com.adprod.inventar.services.DashboardService;
import com.adprod.inventar.services.ExportService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletResponse;


@Service
public class ExportServiceImpl implements ExportService {
    private final DashboardService dashboardService;
    public ExportServiceImpl(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Override
    public void exportDashboardPDF(HttpServletResponse response, Instant from, Instant to) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA);
        dateFont.setSize(14);

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA);
        titleFont.setSize(16);
        LocalDateTime ldtFrom = LocalDateTime.ofInstant(from, ZoneId.systemDefault());
        LocalDateTime ldtTo = LocalDateTime.ofInstant(to, ZoneId.systemDefault());
        String fromDay = ldtFrom.getDayOfMonth() <=9? '0' + String.valueOf(ldtFrom.getDayOfMonth()) : String.valueOf(ldtFrom.getDayOfMonth());
        String toDay = ldtTo.getDayOfMonth() <=9? '0' + String.valueOf(ldtTo.getDayOfMonth()) : String.valueOf(ldtTo.getDayOfMonth());

        String fromMonth = ldtFrom.getMonth().getValue() <=9? '0' + String.valueOf(ldtFrom.getMonth().getValue()) : String.valueOf(ldtFrom.getMonth().getValue());
        String toMonth = ldtTo.getMonth().getValue() <=9? '0' + String.valueOf(ldtTo.getMonth().getValue()) : String.valueOf(ldtTo.getMonth().getValue());

        Paragraph date = new Paragraph("Date: " + fromDay + "/" + fromMonth + "/" + ldtFrom.getYear() + " - " + toDay + "/" + toMonth + "/" + ldtTo.getYear(), dateFont);
        Paragraph title = new Paragraph("Monthly Report - " + StringUtils.capitalize(ldtFrom.getMonth().toString().toLowerCase()), titleFont);
        date.setAlignment(Paragraph.ALIGN_LEFT);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        title.setSpacingBefore(15);
        title.setSpacingAfter(15);
        document.add(date);
        document.add(title);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100f);
        table.setWidths(new float[] {2.0f, 4.0f, 4.0f, 2.5f});
        table.setSpacingBefore(10);

        writeTableHeader(table);
        writeTableData(table, from, to);

        document.add(table);

        document.close();

    }

    private void writeTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(5);
        Font font = FontFactory.getFont(FontFactory.HELVETICA);
        cell.setPhrase(new Phrase("Date", font));

        table.addCell(cell);

        cell.setPhrase(new Phrase("Income", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Expense", font));
        table.addCell(cell);

        cell.setPhrase(new Phrase("Difference", font));
        table.addCell(cell);
    }

    private void writeTableData(PdfPTable table, Instant from, Instant to) {
//        List<DailyExpenseDTO> list = this.dashboardService.getDashboardData(from, to).getBody();
//        list.forEach(item -> {
//            table.addCell(item.get_id());
//            table.addCell(item.getTotal().toString());
//            table.addCell("2,300.39 ALL");
//            table.addCell("1,579.44 ALL");
//        });
    }

}
