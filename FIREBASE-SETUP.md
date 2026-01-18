# 🔥 Firebase + Lovable Setup Guide

This guide will help you configure Genesis Engine with Firebase and Lovable API for a fully cloud-native, serverless architecture.

## Prerequisites

- Node.js 18+ and npm
- Firebase CLI: `npm install -g firebase-tools`
- A Google account for Firebase
- Lovable API account (if using Lovable for external APIs)

## 🚀 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `genesis-engine`
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### 2. Enable Required Services

#### Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable:
   - Email/Password
   - Google
   - Microsoft (for LinkedIn integration)
5. Configure OAuth redirect domains if needed

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you can change security rules later)
4. Select a location (choose one close to your users)

#### Realtime Database
1. Go to **Realtime Database**
2. Click **Create database**
3. Choose **Start in test mode**
4. Select the same location as Firestore

#### Storage
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select the same location

#### Hosting (Optional - for production deployment)
1. Go to **Hosting**
2. Click **Get started** (we'll use this later for production)

### 3. Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** → **Web app** (</>)
4. Enter app nickname: `Genesis Engine Web`
5. Check **Firebase Hosting** if you want to deploy there
6. Click **Register app**
7. Copy the configuration object - you'll need this for environment variables

### 4. Set Up Security Rules

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Companies - owners and members can read/write
    match /companies/{companyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (resource.data.ownerId == request.auth.uid ||
         exists(/databases/$(database)/documents/companyMembers/$(companyId)_$(request.auth.uid)));
    }

    // Company members
    match /companyMembers/{memberId} {
      allow read, write: if request.auth != null;
    }

    // Financial data - company members only
    match /financialProjections/{projectionId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/companyMembers/$(resource.data.companyId)_$(request.auth.uid));
    }

    // Similar rules for other collections...
  }
}
```

#### Realtime Database Rules (`database.rules.json`)
```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "messages": {
      "$conversationId": {
        ".read": "auth != null",
        ".write": "auth != null",
        ".indexOn": ["timestamp"]
      }
    },
    "typing": {
      "$conversationId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    },
    "notifications": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

## 🔗 Lovable API Setup

### 1. Create Lovable Account

1. Go to [Lovable](https://lovable.dev) (or your API platform)
2. Create an account
3. Create a new project: `Genesis Engine API`
4. Get your API key from the dashboard

### 2. Configure API Endpoints

Register the following endpoints in Lovable:

#### Financial Service Endpoints
- `POST /companies/{companyId}/projections` - Create financial projection
- `GET /companies/{companyId}/projections` - Get projections
- `PUT /companies/{companyId}/projections/{projectionId}` - Update projection
- `GET /companies/{companyId}/transactions` - Get transactions
- `POST /companies/{companyId}/transactions` - Create transaction
- `GET /companies/{companyId}/summary` - Get financial summary

#### Compliance Service Endpoints
- `GET /companies/{companyId}/tasks` - Get compliance tasks
- `PUT /companies/{companyId}/tasks/{taskId}` - Update task
- `POST /companies/{companyId}/filings/{type}` - Submit filing
- `GET /companies/{companyId}/check` - Compliance check

#### CRM Service Endpoints
- `GET /companies/{companyId}/contacts` - Get contacts
- `POST /companies/{companyId}/contacts` - Create contact
- `PUT /companies/{companyId}/contacts/{contactId}` - Update contact
- `GET /companies/{companyId}/deals` - Get deals
- `POST /companies/{companyId}/deals` - Create deal

#### Other Services
- Calendar, billing, nexus, pulse, knowledge graph endpoints...

## ⚙️ Environment Configuration

### 1. Copy Environment Template

```bash
cp config/firebase.env.example .env.local
```

### 2. Fill in Firebase Configuration

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=genesis-engine.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=genesis-engine
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=genesis-engine.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://genesis-engine-default-rtdb.firebaseio.com/

# Lovable API Configuration
NEXT_PUBLIC_LOVABLE_API_URL=https://api.lovable.dev
NEXT_PUBLIC_LOVABLE_PROJECT_ID=your_project_id
LOVABLE_API_KEY=your_lovable_api_key
```

### 3. Firebase CLI Login

```bash
firebase login
firebase use --add
# Select your project
```

## 🧪 Testing with Emulators (Development)

### 1. Install Firebase Emulators

```bash
firebase init emulators
# Select: Authentication, Firestore, Realtime Database, Storage
```

### 2. Start Emulators

```bash
firebase emulators:start
```

### 3. Use Emulators in Development

Add to your `.env.local`:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

## 🚀 Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Firebase Hosting (Optional)

```bash
firebase init hosting
firebase deploy --only hosting
```

### 3. Deploy Firebase Functions (if using)

```bash
firebase deploy --only functions
```

## 🔍 Monitoring & Analytics

### 1. Firebase Analytics

Already enabled if you chose Google Analytics during setup.

### 2. Firebase Performance Monitoring

1. Go to **Performance** in Firebase Console
2. Enable performance monitoring
3. Add the SDK to your app

### 3. Firebase Crashlytics

1. Go to **Crashlytics** in Firebase Console
2. Enable Crashlytics
3. Add the SDK for error reporting

## 🔐 Security Best Practices

### 1. Firestore Security Rules

- Use granular read/write permissions
- Validate data structure in rules
- Use authentication checks
- Limit document sizes and array lengths

### 2. Realtime Database Rules

- Implement proper authentication
- Use indexed queries
- Limit data access based on user roles
- Monitor usage and costs

### 3. API Key Security

- Never expose Lovable API key in client-side code
- Use Firebase Functions for server-side API calls
- Implement rate limiting
- Monitor API usage

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not initializing**: Check API key and configuration
2. **Permission denied**: Update Firestore/Realtime Database security rules
3. **Emulators not connecting**: Check if emulators are running on correct ports
4. **API calls failing**: Verify Lovable API key and endpoint configuration

### Debug Mode

Add to your environment for detailed logging:

```env
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=true
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Lovable API Documentation](https://docs.lovable.dev)

## 🎯 Next Steps

1. Test authentication flows
2. Implement company creation and management
3. Set up real-time messaging
4. Configure external API integrations
5. Deploy to production
6. Set up monitoring and analytics

---

**Need help?** Check the [Genesis Engine Documentation](./README.md) or create an issue in the repository.