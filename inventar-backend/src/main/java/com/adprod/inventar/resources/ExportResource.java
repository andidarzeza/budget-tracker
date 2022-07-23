package com.adprod.inventar.resources;

import com.adprod.inventar.services.ExportService;
import com.lowagie.text.DocumentException;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Date;

@RestController
@AllArgsConstructor
@RequestMapping("/api/export")
public class ExportResource {

    private final ExportService exportService;
    private final SimpleDateFormat dateFormatter;

    @GetMapping("/pdf/dashboard")
    public void exportToPDF(HttpServletResponse response, @RequestParam Instant from, @RequestParam Instant to) throws DocumentException, IOException {
        response.setContentType("application/pdf");
        String currentDateTime = dateFormatter.format(new Date());
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=users_" + currentDateTime + ".pdf";
        response.setHeader(headerKey, headerValue);
        exportService.exportDashboardPDF(response, from, to);
    }
}