import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * OTP Provider Interface - abstraction for different OTP sending services
 */
export interface IOTPProvider {
  sendOTP(phone: string, code: string): Promise<void>;
}

/**
 * Console OTP Provider - for development/testing
 * Logs OTP to console instead of sending SMS
 */
class ConsoleOTPProvider implements IOTPProvider {
  async sendOTP(phone: string, code: string): Promise<void> {
    logger.info(`📱 OTP for ${phone}: ${code}`);
    console.log('\n=================================');
    console.log(`  OTP CODE: ${code}`);
    console.log(`  Phone: ${phone}`);
    console.log('=================================\n');
  }
}

/**
 * Twilio OTP Provider - for production SMS sending
 */
class TwilioOTPProvider implements IOTPProvider {
  async sendOTP(phone: string, code: string): Promise<void> {
    // Note: Implementation requires Twilio SDK
    // This is a placeholder for when user adds Twilio integration
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured');
    }

    logger.info(`Sending OTP via Twilio to ${phone}`);
    
    // TODO: Implement Twilio SDK integration
    // const client = require('twilio')(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your verification code is: ${code}`,
    //   from: env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    console.warn('Twilio integration not yet implemented. OTP:', code);
  }
}

/**
 * AWS SNS OTP Provider - for production SMS sending via AWS
 */
class AWSSNSOTPProvider implements IOTPProvider {
  async sendOTP(phone: string, code: string): Promise<void> {
    // Note: Implementation requires AWS SDK
    // This is a placeholder for when user adds AWS integration
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }

    logger.info(`Sending OTP via AWS SNS to ${phone}`);
    
    // TODO: Implement AWS SNS integration
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS({ region: env.AWS_REGION });
    // await sns.publish({
    //   Message: `Your verification code is: ${code}`,
    //   PhoneNumber: phone
    // }).promise();

    console.warn('AWS SNS integration not yet implemented. OTP:', code);
  }
}

/**
 * Factory function to get the appropriate OTP provider
 */
export const getOTPProvider = (): IOTPProvider => {
  switch (env.OTP_PROVIDER) {
    case 'twilio':
      return new TwilioOTPProvider();
    case 'aws-sns':
      return new AWSSNSOTPProvider();
    case 'console':
    default:
      return new ConsoleOTPProvider();
  }
};
