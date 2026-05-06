package com.adprod.inventar.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * A {@link Project} bundled with its current per-currency saved totals.
 * Used on the projects list page so the UI can render progress without a second round-trip.
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ProjectViewDTO {
    private Project project;
    /** Saved amounts grouped by currency (zeros omitted). */
    private List<CurrencyTotalDTO> totalsByCurrency;
}
