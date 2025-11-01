#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const APP_NAME = "cognito-ex";

const app = new cdk.App();
new CdkStack(app, `${APP_NAME}-WelcomeMail`, {});
