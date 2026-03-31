from etl.contracts import QualityGateResult, SourceValidationReport


def test_source_validation_report_accepts_expected_shape() -> None:
    report = SourceValidationReport(
        source_name="sample-od",
        source_kind="od",
        adopted_as="Secondary",
        access_method="fixture",
        auth_required=False,
        grain_label="station_to_zone",
        date_range={"from": "2026-03-01", "to": "2026-03-31"},
        notes=["fixture only"],
    )

    assert report.grain_label == "station_to_zone"


def test_quality_gate_result_passes_boolean_contract() -> None:
    result = QualityGateResult(
        station_id="sangil-5-551",
        passed=True,
        evaluated_at="2026-03-31T00:00:00Z",
        metrics=[],
    )

    assert result.passed is True
