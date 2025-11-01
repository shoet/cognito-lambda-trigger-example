#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const APP_NAME = "cognito-lambda-trigger-example";

const app = new cdk.App();
new CdkStack(app, `${APP_NAME}-PreSignUp`, {});

