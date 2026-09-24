SHELL := /bin/bash

AWS_DIR := platforms/aws
AWS_ENDPOINT := http://127.0.0.1:4566

AWS_ENV := \
	AWS_ACCESS_KEY_ID=test \
	AWS_SECRET_ACCESS_KEY=test \
	AWS_DEFAULT_REGION=eu-west-1

.PHONY: help \
	aws-init aws-fmt aws-validate aws-plan \
	aws-apply aws-check aws-destroy aws-cycle

help:
	@echo "Multicloud Platform Lab"
	@echo
	@echo "AWS / Floci:"
	@echo "  make aws-init       Initialize OpenTofu"
	@echo "  make aws-fmt        Check OpenTofu formatting"
	@echo "  make aws-validate   Validate configuration"
	@echo "  make aws-plan       Generate execution plan"
	@echo "  make aws-apply      Deploy local AWS resources"
	@echo "  make aws-check      Validate resources independently"
	@echo "  make aws-destroy    Destroy local AWS resources"
	@echo "  make aws-cycle      Run complete local lifecycle"

aws-init:
	cd $(AWS_DIR) && $(AWS_ENV) tofu init

aws-fmt:
	tofu fmt -check -recursive $(AWS_DIR)

aws-validate:
	cd $(AWS_DIR) && $(AWS_ENV) tofu validate

aws-plan:
	cd $(AWS_DIR) && $(AWS_ENV) tofu plan

aws-apply:
	cd $(AWS_DIR) && $(AWS_ENV) tofu apply -auto-approve

aws-check:
	@echo "===== AWS / FLOCI RESOURCES ====="
	@$(AWS_ENV) aws \
		--endpoint-url $(AWS_ENDPOINT) \
		s3api list-buckets \
		--query 'Buckets[].Name' \
		--output table

aws-destroy:
	cd $(AWS_DIR) && $(AWS_ENV) tofu destroy -auto-approve

aws-cycle:
	$(MAKE) aws-init
	$(MAKE) aws-fmt
	$(MAKE) aws-validate
	$(MAKE) aws-plan
	$(MAKE) aws-apply
	$(MAKE) aws-check
	$(MAKE) aws-destroy
