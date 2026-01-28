import { verificationEmailTemplate } from './utils/emailTemplates.js';
try {
    console.log(verificationEmailTemplate('123456', 10));
    console.log('✅ Template Syntax Valid');
} catch (error) {
    console.error('❌ Template Error:', error);
}
