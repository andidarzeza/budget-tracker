package com.adprod.inventar.services;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;

public interface ExportService {
    void exportDashboardPDF(HttpServletResponse response, Instant from, Instant to) throws IOException;
}
