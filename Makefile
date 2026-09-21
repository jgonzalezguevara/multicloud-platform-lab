SHELL := /bin/bash

AWS_DIR := platforms/aws

.PHONY: help aws-init aws-fmt aws-validate aws-plan

help:
	@echo "Multicloud Platform Lab"
	@echo
	@echo "AWS:"
	@echo "  make aws-init"
	@echo "  make aws-fmt"
	@echo "  make aws-validate"
	@echo "  make aws-plan"

aws-init:
	cd $(AWS_DIR) && tofu init

aws-fmt:
	tofu fmt -check -recursive $(AWS_DIR)

aws-validate:
	cd $(AWS_DIR) && tofu validate

aws-plan:
	cd $(AWS_DIR) && tofu plan
