package com.adprod.inventar.services;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public interface ExportService {
    void exportDashboardPDF(HttpServletResponse response) throws IOException;
}
