import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';
import Author from './models/Author.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const blogs = [
  {
    title: "Ku Bilowga Programming: Tallaabooyinka Aasaasiga ah",
    category: "programming",
    date: "2025-01-15",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    content: `Programming-ka waa xirfad aad u qiimo badan waqtiga casriga ah. Maqaalkaan waxaan ku eegi doonaa tallaabooyinka aasaasiga ah ee qof walba uu ku bilaabi karo safarka programming-ka.

## Waa Maxay Programming?
Programming waa hab lagu abuuro software-ka iyo apps-ka. Waxaad baran doontaa sidii loo qoro code-ka si aad u abuurto waxyaabo cusub.

## Luuqadaha Programming ee Muhiimka ah
- **JavaScript**: Luuqadda ugu caansan web development-ka
- **Python**: Fudud oo loo isticmaalo data analysis iyo AI
- **Java**: Loogu talagalay enterprise applications

## Tallaabooyinka Bilowga
1. Dooro luuqad aad rabto inaad barato
2. Soo dejiso text editor (VS Code ayaa fiican)
3. Bilow casharro fudud
4. Dhis projects yar yar
5. Ka qayb gal community-ga

Programming-ka waa safar xiiso leh oo aan dhammaanayn. Ku dadaal oo ha quusan!`
  },
  {
    title: "React Hooks: Habka Casriga ah ee State Management",
    category: "web-development",
    date: "2025-01-20",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    content: `React Hooks waxay beddeleen habkii loo maamulo state-ka iyo lifecycle-ka ee React components. Maqaalkaan waxaan ku baari doonaa hooks-ka ugu muhiimsan.

## Waa Maxay React Hooks?
Hooks waa functions cusub oo lagu qoro React components-ka adigoon isticmaalin class components.

## Hooks-ka Muhiimka ah
### useState
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect
\`\`\`jsx
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

### useContext
Waxaa loo isticmaalaa in lagu wadaago data components-ka dhexdooda.

## Faa'iidooyinka Hooks
- Code yar oo nadiif ah
- Waxaa lagu qori karaa functional components
- Waxaa lagu test gareyn karaa si fudud
- Waxay fududeeyaan logic reuse

Hooks waxay ka dhigaan React development-ka mid fudud oo casri ah.`
  },
  {
    title: "Full-Stack Development: Frontend iyo Backend Integration",
    category: "web-development",
    date: "2025-01-25",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    content: `Full-stack development waa xirfad dhameystiran oo ku saabsan dhismaha web applications oo dhan. Waxaan ku baari doonaa isku xirka frontend iyo backend.

## Waa Maxay Full-Stack?
Full-stack developer waa qof yaqaan frontend (client-side) iyo backend (server-side) development.

## Frontend Technologies
- **React**: Component-based UI library
- **Vue.js**: Progressive framework
- **Angular**: Complete framework

## Backend Technologies
- **Node.js**: JavaScript runtime
- **Python/Django**: High-level framework
- **PHP/Laravel**: Elegant framework

## API Integration
REST APIs iyo GraphQL ayaa isku xira frontend iyo backend-ka. Waxaa muhiim ah in la fahmo HTTP methods:
- GET: Helitaanka data
- POST: Abuurista data cusub
- PUT: Cusboonaysiinta data
- DELETE: Tirtirka data

## Database Design
- **MongoDB**: NoSQL database
- **PostgreSQL**: Relational database
- **MySQL**: Popular relational database

Full-stack development waa xirfad ballaaran oo fursado shaqo badan leh.`
  },
  {
    title: "Mobile App Development: React Native vs Flutter",
    category: "mobile-development",
    date: "2025-02-01",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    content: `Mobile app development waxay noqotay mid muhiim u ah ganacsiga casriga ah. Waxaan is barbar dhigi doonaa React Native iyo Flutter.

## React Native
React Native waa framework ay leedahay Facebook oo loogu talagalay mobile app development.

### Faa'iidooyinka
- Waxaa lagu qoraa JavaScript
- Community weyn
- Hot reloading feature
- Cross-platform

## Flutter
Flutter waa framework ay leedahay Google oo loogu talagalay mobile iyo web development.

### Faa'iidooyinka
- Waxaa lagu qoraa Dart
- UI components tayo sare leh
- Performance sare
- Single codebase

## Code Comparison

### React Native
\`\`\`jsx
import React from 'react';
import { Text, View } from 'react-native';

const App = () => {
  return (
    <View>
      <Text>Hello React Native!</Text>
    </View>
  );
};
\`\`\`

### Flutter
\`\`\`dart
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Text('Hello Flutter!'),
        ),
      ),
    );
  }
}
\`\`\`

Labada framework waxay leeyihiin faa'iidooyin u gaar ah. Doorashada waxay ku xiran tahay baahiyaha project-kaaga.`
  },
  {
    title: "Database Design: Normalization vs Denormalization",
    category: "database",
    date: "2025-02-05",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    content: `Database design waa aasaaska application kasta oo tayo leh. Waxaan ku baari doonaa normalization iyo denormalization.

## Normalization
Normalization waa hab lagu habeeyo database-ka si looga fogaado redundancy iyo anomalies.

### Normal Forms
1. **1NF**: Atomic values
2. **2NF**: No partial dependencies
3. **3NF**: No transitive dependencies

### Faa'iidooyinka
- Waxay yareysaa data redundancy
- Waxay hubisaa data integrity
- Waxay fududeysaa updates

## Denormalization
Denormalization waxaa lagu sameeyaa performance-ka dartii, inkastoo ay keento redundancy.

### Xaaladaha Loo Isticmaalo
- Read-heavy applications
- Reporting systems
- Real-time analytics

## Tusaale
### Normalized Table
\`\`\`sql
users (id, name, email)
posts (id, title, content, user_id)
\`\`\`

### Denormalized Table
\`\`\`sql
posts (id, title, content, user_name, user_email)
\`\`\`

## Go'aan Qaadashada
- Normalization: Data integrity muhiim
- Denormalization: Performance muhiim

Doorashada waxay ku xiran tahay baahiyaha application-kaaga.`
  },
  {
    title: "DevOps Practices: CI/CD Pipelines",
    category: "devops",
    date: "2025-02-10",
    thumbnail: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=400&fit=crop",
    content: `DevOps waxay isku xirtaa development iyo operations. CI/CD pipelines ayaa ah qeyb muhiim ah oo DevOps.

## Waa Maxay CI/CD?
- **CI (Continuous Integration)**: Automatic testing iyo integration
- **CD (Continuous Delivery/Deployment)**: Automatic deployment

## Tools-ka CI/CD
- **GitHub Actions**: Free oo integrated
- **Jenkins**: Open source CI server
- **GitLab CI**: Integrated CI/CD
- **CircleCI**: Cloud-based platform

## Pipeline Stages
1. **Source**: Code changes detection
2. **Build**: Code compilation
3. **Test**: Automated testing
4. **Deploy**: Application deployment

## YAML Configuration Example
\`\`\`yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm install
    - run: npm test
    - run: npm run build
\`\`\`

CI/CD waxay hubisaa in code-kaagu uu had iyo jeer diyaar yahay production deployment.`
  },
  {
    title: "API Design: REST vs GraphQL",
    category: "api",
    date: "2025-02-15",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    content: `API design waa qeyb muhiim ah oo application architecture. Waxaan is barbar dhigi doonaa REST iyo GraphQL.

## REST APIs
REST (Representational State Transfer) waa style architectural ah.

### Characteristics
- Stateless
- Resource-based
- HTTP methods (GET, POST, PUT, DELETE)
- JSON responses

### Example
\`\`\`
GET /api/users
GET /api/users/1
POST /api/users
PUT /api/users/1
DELETE /api/users/1
\`\`\`

## GraphQL
GraphQL waa query language loogu talagalay APIs.

### Faa'iidooyinka
- Single endpoint
- Client-side query specification
- No over-fetching/under-fetching
- Strong typing

### Example Query
\`\`\`graphql
query {
  user(id: 1) {
    name
    email
    posts {
      title
      content
    }
  }
}
\`\`\`

## REST vs GraphQL
- **REST**: Simple, caching-friendly
- **GraphQL**: Flexible, efficient data fetching

Doorashada waxay ku xiran tahay baahiyaha project-kaaga.`
  },
  {
    title: "Machine Learning: Bilowga AI Development",
    category: "ai",
    date: "2025-02-20",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop",
    content: `Machine Learning waxay noqotay qeyb muhiim ah oo technology-ka casriga ah. Waxaan ku baari doonaa bilowga AI development.

## Waa Maxay Machine Learning?
Machine Learning waa AI subfield oo algorithms ka barta data-ka.

## Types of ML
1. **Supervised Learning**: Labeled data training
2. **Unsupervised Learning**: Unlabeled data patterns
3. **Reinforcement Learning**: Reward-based learning

## Python Libraries
- **Scikit-learn**: General ML library
- **TensorFlow**: Deep learning framework
- **PyTorch**: Research-oriented framework
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing

## Simple Example
\`\`\`python
from sklearn.linear_model import LinearRegression
import numpy as np

# Training data
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2, 4, 6, 8, 10])

# Model training
model = LinearRegression()
model.fit(X, y)

# Prediction
prediction = model.predict([[6]])
print(prediction)  # Output: [12]
\`\`\`

## Applications
- Image recognition
- Natural language processing
- Recommendation systems
- Fraud detection

Machine Learning waxay leedahay fursado ballaaran mustaqbalka.`
  },
  {
    title: "Cybersecurity: Web Application Security",
    category: "security",
    date: "2025-02-25",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
    content: `Web application security waa muhiim u ah ilaalinta data iyo users. Waxaan ku baari doonaa hanjabaadaha caadiga ah iyo difaaca.

## Common Vulnerabilities
1. **SQL Injection**: Database manipulation
2. **XSS (Cross-Site Scripting)**: Client-side code injection
3. **CSRF (Cross-Site Request Forgery)**: Unauthorized actions
4. **Broken Authentication**: Weak auth mechanisms

## Security Best Practices
### Input Validation
- Sanitize all user inputs
- Use parameterized queries
- Validate data types and formats

### Authentication & Authorization
- Use strong password policies
- Implement multi-factor authentication
- Role-based access control

### HTTPS Implementation
\`\`\`javascript
const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

// SSL certificates
const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(443);
\`\`\`

## Security Headers
\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
\`\`\`

## Tools-ka Security
- **OWASP ZAP**: Vulnerability scanner
- **Burp Suite**: Web vulnerability testing
- **SonarQube**: Code quality and security

Security waa continuous process, ma ahan hal tallaabo.`
  },
  {
    title: "Cloud Computing: AWS vs Google Cloud vs Azure",
    category: "cloud",
    date: "2025-03-01",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    content: `Cloud computing waxay beddeshay habka businesses-ka ay u maamulaan IT resources. Waxaan is barbar dhigi doonaa AWS, Google Cloud, iyo Azure.

## Amazon Web Services (AWS)
AWS waa cloud platform-ka ugu weyn adduunka.

### Services-ka Muhiimka ah
- **EC2**: Virtual servers
- **S3**: Object storage
- **Lambda**: Serverless computing
- **RDS**: Managed databases

## Google Cloud Platform (GCP)
GCP waa platform-ka Google ee cloud computing.

### Faa'iidooyinka
- Strong AI/ML capabilities
- Competitive pricing
- Kubernetes expertise
- Big data tools

## Microsoft Azure
Azure waa cloud platform-ka Microsoft.

### Faa'iidooyinka
- Windows integration
- Enterprise focus
- Hybrid cloud solutions
- Developer tools

## Comparison Factors
- **Pricing**: GCP (cheapest), AWS (flexible), Azure (enterprise discounts)
- **AI/ML**: GCP strongest, AWS growing, Azure enterprise
- **Enterprise**: Azure strongest, AWS broad, GCP modern

## Migration Strategy
1. Assessment: Current infrastructure evaluation
2. Planning: Cloud architecture design
3. Migration: Phased implementation
4. Optimization: Cost and performance tuning

Doorashada cloud provider waxay ku xiran tahay baahiyaha business-kaaga.`
  }
];

const seedBlogs = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to database...');

    // Get all authors
    const authors = await Author.find({});
    if (authors.length === 0) {
      console.error('No authors found. Please seed authors first.');
      process.exit(1);
    }

    console.log(`Found ${authors.length} authors`);

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Prepare blogs with author references
    const blogsWithAuthors = blogs.map((blog, index) => ({
      ...blog,
      author: authors[index % authors.length]._id // Alternate between available authors
    }));

    // Insert new blogs
    await Blog.insertMany(blogsWithAuthors);
    console.log(`Successfully seeded ${blogs.length} blogs`);

    process.exit();
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
};

seedBlogs();

