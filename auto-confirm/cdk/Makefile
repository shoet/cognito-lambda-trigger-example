.DEFAULT_GOAL := help

.PHONY: deploy
deploy: ## Deploy
	npx cdk deploy --require-approval never cognito-lambda-trigger-example-PreSignUp

destroy: ## Destroy
	npx cdk destroy --force

logs: ## Show log
	aws logs tail --follow cognito-lambda-trigger-example-PreSignUp-PreSignUpLambdaLogGroup

.PHONY: help
help: ## Show options
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
    awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
