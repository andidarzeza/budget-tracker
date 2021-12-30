package com.adprod.inventar.services.implementations;

import java.awt.Color;
import java.io.IOException;
import com.adprod.inventar.services.ExportService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import javax.servlet.http.HttpServletResponse;


@Service
public class ExportServiceImpl implements ExportService {

    public ExportServiceImpl() {}

    @Override
    public void exportDashboardPDF(HttpServletResponse response) throws DocumentException, IOException {
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA);
        dateFont.setSize(14);

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA);
        titleFont.setSize(16);

        Paragraph date = new Paragraph("Date: 01/12/2021 - 31/12/2021", dateFont);
        Paragraph title = new Paragraph("Monthly Report - December", titleFont);
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
        writeTableData(table);

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

    private void writeTableData(PdfPTable table) {
            table.addCell("23/12/2021");
            table.addCell("2,430 ALL");
            table.addCell("2,300.39 ALL");
            table.addCell("1,579.44 ALL");
    }

}
