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

