# Fraud Detection Backend API

## Overview
This API is a core component of a security module designed for robust account management in the banking sector. It enhances user security through authentication and real-time fraud detection, specifically targeting spam and malicious URLs to safeguard users.

## Core Components

### User Authentication and Authorization Module
- **Description**: Ensures access is granted only to legitimate users using advanced mechanisms like two-factor authentication (2FA) and biometric verification.
- **Features**:
  - Roles and permissions management to control user actions within their accounts.

### Fraud Detection Module
- **Description**: Incorporates a GPT module and utilizes real-time machine learning algorithms to analyze transaction patterns and detect anomalies.
- **Real-Time Monitoring**: Capable of reading user SMS messages in real-time to evaluate and score URLs for legitimacy, alerting users about potential phishing URLs instantly.
- **Data Processing**: Designed to handle and process large volumes of data efficiently.

### MongoDB Database
- **Description**: Utilized for storing user data, transaction histories, and a blacklist of malicious URLs.
- **Capabilities**:
  - Supports high availability, horizontal scaling, and geographic distribution essential for large-scale banking applications.

## Key Features

- **Real-Time Alert System**: Sends instant notifications to users upon detecting suspicious activities or URLs.
- **Data Privacy and Security**: All user data is encrypted and securely stored, adhering to the latest data protection regulations.
- **Scalability**: Capable of managing increasing data volumes without performance loss.
- **API Integration**: Provides seamless integration with existing banking applications through RESTful APIs.

## Security Protocols

- **Data Transmission**: Uses TLS for secure data transmission.
- **Maintenance**: Regularly updates and patches to safeguard against new vulnerabilities.
- **Monitoring and Auditing**: Continuously monitors and logs all activities for complete traceability and auditability.

## Getting Started

### Prerequisites
- Node.js version 12.x or higher.
- MongoDB version 4.4 or higher.
- An operational environment that supports Docker (optional).

### Installation Instructions

```bash
git clone https://github.com/yourusername/fraud-detection-api.git
cd fraud-detection-api
npm install pm2 -g
pm2 start all
```

### Build the Docker image and run the container:
```Using Docker:
docker-compose up -d
```

### Configuration
Create a .env file in the root directory and populate it with necessary configurations:
```
PORT=8080
DB_HOST=localhost
MongoDB_USER=admin
MongoDB_PASSWORD=Password@123
LoginUser=admin
LoginPass=Password@123
DB_URL=mongodb://localhost:27017/userMng
USER_SECRET_KEY=7d43071c-b9ed-4426-bc6f-8a1d58334c60
APP_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Google_Client_ID=1080268202505-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
Google_Client_Secret=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//Session Expire in hours
expiresIn="24h"
//tokenExpiryDays in Days 
tokenExpiryDays="1"
//OTPExpiryMins in Min 
OTPExpiryMins ="5"
userAPICountCAP=167

```

### API Endpoints
## User Management

- Register Mobile No: `http://{{hosted_server_ip}}:8080/api/v1/users/register`
- OTP Verification: `http://{{hosted_server_ip}}:8080/api/v1/users/verify-otp`
- Resend OTP: `http://{{hosted_server_ip}}:8080/users/resendOTP`
- Set MPIN: `http://{{hosted_server_ip}}:8080/api/v1/users/mpin/set`
- Login with MPIN: `http://{{hosted_server_ip}}:8080/users/mpinlogin`
- Update Profile: `http://{{hosted_server_ip}}:8080/api/v1/users/profile/update`
- View Profile: `http://{{hosted_server_ip}}:8080/users/viewProfile?mobile=8707516276`
- Google SSO Login: `http://{{hosted_server_ip}}:8080/auth/google/`
- Logout Single Session: `http://{{hosted_server_ip}}:8080/auth/google/`
- Logout All Sessions: `http://{{hosted_server_ip}}:8081/api/v1/users/logout/all`

### Fraud Detection
- Process SMS for Fraud Detection: http://{{hosted_server_ip}}:8080/process-json

```
header: optional
message: 
{
    "SMS-Deatil": {
        "header": "ICICIBK01",
        "message": "Dear Customer, your SBI account has been temporarily blocked due to incomplete KYC updates. To restore access, please visit https://spam_url.com and complete your KYC immediately. Regards, SBI Head Office."
    }
}

```

### Postman Collection
You can access the Postman collection for this API using the following public link: Access Postman Collection <https://api.postman.com/collections/25261584-2b1e88bf-04c0-450a-903f-c55d6a7b65bb?access_key=PMAT-01JGRSZTN7RDHTM6CBYB5BQDAN>

### Contributing
Contributions are encouraged. Please refer to the CONTRIBUTING.md for contribution guidelines.

### License
This project is licensed under the MIT License - see the LICENSE.md file for details.

### Acknowledgments
- Appreciation to all team members and contributors.
- Acknowledgment of any third-party libraries used.
```
This version of the README includes complete information on the API endpoints, how to run the application using different methods, and a link to access the API via a Postman collection. This setup is intended to guide users through installation, configuration, and initial usage of the Fraud Detection Backend API.
```
