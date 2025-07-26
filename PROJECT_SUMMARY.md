# 🏥 Temporal Medical Coding System - Project Summary

## 🎯 **Project Overview**

This is a **production-ready medical coding system** that demonstrates the power of **Temporal workflows** combined with **Amazon Bedrock AI** to automate the complex process of assigning accurate ICD-10 diagnosis and procedure codes from unstructured clinical documents.

## 🚀 **Key Features**

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


## 🏗️ **Architecture**

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

## 📁 **Project Structure**

```
awshacks-jul25/
├── README.md                           # Comprehensive project documentation
├── requirements.txt                    # Python dependencies
├── .gitignore                         # Git ignore rules
├── LICENSE                            # MIT License
├── app.py                             # Flask web application
├── temporal_medical_coding_demo.py    # Main Temporal workflow system
├── templates/                         # HTML templates
│   └── index.html                     # Main web interface
└── static/                            # Static assets
    ├── css/
    │   └── style.css                  # Professional medical UI styling
    └── js/
        └── app.js                     # Frontend JavaScript functionality
```
