.DEFAULT_GOAL := help

.PHONY: deploy
deploy: ## Deploy
	npx cdk deploy --require-approval never cognito-ex-WelcomeMail

destroy: ## Destroy
	npx cdk destroy --force

logs-post-confirm: ## Show log trigger PostConfirm
	aws logs tail --follow  cognito-ex-WelcomeMail-PostConfirmationLambdaLogGroup

logs-custom-message: ## Show log trigger CustomMessage
	aws logs tail --follow  cognito-ex-WelcomeMail-CustomMessageLambdaLogGroup

.PHONY: help
help: ## Show options
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
    awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
