def validate_contribution(data, config):
    # قراءة ديناميكية من config لمنع الهدر البنيوي
    validation_rules = config.get("validation_rules", {})
    confidence_config = validation_rules.get("confidence_threshold", {})
    base_threshold = confidence_config.get("base", 0.5)

    self_confidence = data.get('confidence', 0)
    validation_score = calculate_validation_score(data)
    contributor_id = data.get('_meta', {}).get('contributor_id')

    # معالجة المساهمين الجدد
    new_contributor_policy = validation_rules.get("new_contributor_policy", {})
    is_new = new_contributor_policy.get("new_contributor_mode", False) and not has_previous_contributions(contributor_id)

    if is_new:
        weights = new_contributor_policy.get("weight_adjustment", {"self_confidence": 0.57, "validation_score": 0.43})
        review_history = new_contributor_policy.get("default_review_history", None)
        effective_confidence = (weights['self_confidence'] * self_confidence) + (weights['validation_score'] * validation_score)
    else:
        review_history = get_contributor_review_score(contributor_id)
        weights = {'self_confidence': 0.4, 'validation_score': 0.3, 'review_history': 0.3}
        effective_confidence = (weights['self_confidence'] * self_confidence) + \
                               (weights['validation_score'] * validation_score) + \
                               (weights['review_history'] * review_history)

    # تطبيق العتبة التجريبية
    current_threshold = base_threshold
    experimental = confidence_config.get("experimental", {})
    if experimental and is_experimental_period(experimental.get("period")):
        current_threshold = experimental.get("value", base_threshold)

    # الفحص الأخلاقي
    ethics = data.get('Ethics_Check', {})
    if ethics.get('compliance') == 'Non_Compliant':
        return "REJECTED", {"reason": "ETHICS_VIOLATION"}
    elif ethics.get('compliance') == 'Needs_Review':
        return "REVIEW_REQUIRED", {"reason": "ETHICS_REVIEW_NEEDED", "effective_confidence": round(effective_confidence, 2)}

    # التحقق النهائي
    if effective_confidence < current_threshold:
        return "REVIEW_REQUIRED", {
            "reason": f"LOW_EFFECTIVE_CONFIDENCE (threshold: {current_threshold})",
            "actual": round(effective_confidence, 2),
            "action": "human_review_requested"
        }
    return "ACCEPTED", {"effective_confidence": round(effective_confidence, 2)}
