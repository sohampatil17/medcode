# 🏥 Temporal Medical Coding System

A production-ready medical coding system that leverages **Amazon Bedrock AI** and **Temporal workflows** to automate the assignment of accurate ICD-10 diagnosis and procedure codes from unstructured clinical documents.

## 🚀 Features

### ✅ **Real Amazon Bedrock AI Integration**
- **Claude 3.5 Sonnet** for advanced medical document analysis
- **Intelligent ICD-10 code generation** with confidence scoring
- **AI-powered quality validation** and compliance checking
- **Natural language processing** for clinical text understanding

### ✅ **Temporal Workflow Orchestration**
- **Robust error handling** with automatic retries
- **State management** and progress tracking
- **Scalable workflow execution** for high-volume processing
- **Production-ready reliability** and fault tolerance

### ✅ **Healthcare Compliance**
- **ICD-10-CM** diagnosis code generation
- **ICD-10-PCS** procedure code generation
- **Quality assurance** and validation checks
- **Audit trail** and traceability

### ✅ **Professional Web Interface**
- **Clean, medical-grade UI** with HIPAA compliance
- **Real-time progress tracking** and status updates
- **Comprehensive result display** with confidence scores
- **Sample document testing** and demo capabilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Interface │    │  Temporal Server │    │ Amazon Bedrock  │
│   (Flask)       │◄──►│   (Workflows)    │◄──►│   (Claude AI)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └──────────────►│  Temporal Worker │◄────────────┘
                        │   (Activities)   │
                        └──────────────────┘
```

## 🛠️ Technology Stack

- **Backend**: Python, Temporal, Flask
- **AI/ML**: Amazon Bedrock (Claude 3.5 Sonnet)
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Workflow Engine**: Temporal
- **API Integration**: LiteLLM for Bedrock

## 📋 Prerequisites

- Python 3.8+
- Temporal CLI
- AWS Account with Bedrock access
- AWS credentials configured

## 🚀 Quick Start

### 1. **Clone and Setup**
```bash
git clone <repository-url>
cd awshacks-jul25
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. **Configure AWS Credentials**
Create a `.env` file in the project root:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION_NAME=us-east-1
```

### 3. **Start Temporal Server**
```bash
temporal server start-dev
```

### 4. **Start the System**
In separate terminals:

**Terminal 1 - Temporal Worker:**
```bash
source venv/bin/activate
python temporal_medical_coding_demo.py
```

**Terminal 2 - Web Interface:**
```bash
source venv/bin/activate
python app.py
```

### 5. **Access the Application**
Open your browser and navigate to: `http://localhost:5000`

## 🎯 Usage

### **Demo Mode**
1. Click **"Show AI Results"** to see completed Amazon Bedrock AI workflow results
2. Click **"Start AI Workflow"** to process a new document with real AI
3. Click **"Clear Results"** to reset the interface

### **Manual Processing**
1. Enter patient information and medical document content
2. Click **"Process Document"** to start Amazon Bedrock AI analysis
3. Monitor real-time progress and view results

### **Sample Documents**
Use the provided sample medical documents to test different scenarios:
- **Chest Pain Case**: Emergency consultation with cardiac procedures
- **Diabetes Management**: Follow-up visit with chronic disease management
- **Pneumonia Case**: Inpatient admission with respiratory conditions

## 📊 What You'll See

### **Real Amazon Bedrock AI Results**
- **Diagnosis Codes**: Accurate ICD-10-CM codes with confidence scores
- **Procedure Codes**: Precise ICD-10-PCS codes with evidence
- **Quality Metrics**: AI-generated accuracy and compliance scores
- **Processing Time**: Real-time performance tracking

### **Temporal Workflow Features**
- **Step-by-step Progress**: Document analysis → Code generation → Validation → Report
- **Error Handling**: Automatic retries and graceful failure recovery
- **State Management**: Persistent workflow state and progress tracking

## 🔧 Configuration

### **Amazon Bedrock Models**
The system uses Claude 3.5 Sonnet for optimal medical text understanding:
- **Model ID**: `anthropic.claude-3-sonnet-20240229-v1:0`
- **Temperature**: 0.1 (for consistent, accurate results)
- **Max Tokens**: 2000 (for comprehensive analysis)

### **Temporal Settings**
- **Task Queue**: `medical-coding-task-queue`
- **Retry Policy**: 3 attempts with exponential backoff
- **Timeouts**: 5 minutes for AI activities, 3 minutes for validation

## 🏆 Production Features

### **Scalability**
- **Horizontal scaling** with multiple Temporal workers
- **Batch processing** capabilities for high-volume workflows
- **Load balancing** across multiple AI model instances

### **Reliability**
- **Fault tolerance** with automatic retry mechanisms
- **State persistence** across workflow restarts
- **Error recovery** and graceful degradation

### **Monitoring**
- **Real-time progress tracking** and status updates
- **Performance metrics** and processing time analysis
- **Quality assurance** with confidence scoring

## 🎯 Use Cases

### **Healthcare Providers**
- **Automated medical coding** for clinical documentation
- **Quality assurance** and compliance checking
- **Reduced manual workload** for medical coders

### **Insurance Companies**
- **Accurate claim processing** with validated codes
- **Compliance verification** and audit support
- **Faster claim adjudication** with AI-powered analysis

### **Healthcare Systems**
- **Standardized coding** across multiple facilities
- **Improved accuracy** and reduced coding errors
- **Scalable processing** for high-volume operations

## 🔒 Security & Compliance

- **HIPAA-compliant** data handling
- **Secure AWS integration** with IAM roles
- **Audit trail** for all processing activities
- **Data encryption** in transit and at rest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Temporal Technologies** for the robust workflow orchestration platform
- **Amazon Web Services** for the Bedrock AI service
- **Anthropic** for the Claude AI models
- **Healthcare community** for domain expertise and feedback

---

**Built with ❤️ for the healthcare community** 