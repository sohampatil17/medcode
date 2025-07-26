#!/usr/bin/env python3
"""
Medical Coding System - Web UI
A clean, professional interface for medical coding automation with Amazon Bedrock AI
"""

from flask import Flask, render_template, request, jsonify, session
import asyncio
import json
import uuid
from datetime import datetime
import threading
import time
import logging

# Import our Temporal workflow
from temporal_medical_coding_demo import (
    Client, 
    MedicalCodingWorkflow
)

app = Flask(__name__)
app.secret_key = 'medical-coding-secret-key-2025'

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable to store workflow results
workflow_results = {}

@app.route('/')
def index():
    """Main dashboard page."""
    return render_template('index.html')

@app.route('/api/process-document', methods=['POST'])
def process_document():
    """API endpoint to process medical documents with Amazon Bedrock AI."""
    try:
        data = request.get_json()
        document_content = data.get('content', '')
        patient_name = data.get('patient_name', 'Unknown')
        document_type = data.get('document_type', 'discharge_summary')
        
        if not document_content.strip():
            return jsonify({'error': 'Document content is required'}), 400
        
        # Generate unique document ID
        document_id = f"DOC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        
        # Create document object
        document = {
            "document_id": document_id,
            "content": document_content,
            "document_type": document_type,
            "patient_id": f"PAT-{str(uuid.uuid4())[:8]}",
            "patient_name": patient_name,
            "timestamp": datetime.now().isoformat()
        }
        
        # Start workflow in background
        workflow_id = f"web-{document_id}-{int(time.time())}"
        workflow_results[workflow_id] = {
            'status': 'processing',
            'progress': 0,
            'message': 'Initializing Amazon Bedrock AI workflow...',
            'result': None
        }
        
        logger.info(f"Starting Amazon Bedrock AI workflow {workflow_id} for document {document_id}")
        
        # Run workflow in background thread
        thread = threading.Thread(
            target=run_workflow_background,
            args=(workflow_id, document)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'workflow_id': workflow_id,
            'document_id': document_id,
            'status': 'processing',
            'message': 'Amazon Bedrock AI workflow started successfully'
        })
        
    except Exception as e:
        logger.error(f"Error starting Amazon Bedrock AI workflow: {str(e)}")
        return jsonify({'error': str(e)}), 500

def run_workflow_background(workflow_id, document):
    """Run the Temporal workflow with Amazon Bedrock AI in a background thread."""
    try:
        logger.info(f"Background thread started for Amazon Bedrock AI workflow {workflow_id}")
        
        # Update progress
        workflow_results[workflow_id]['progress'] = 10
        workflow_results[workflow_id]['message'] = 'Connecting to Temporal and Amazon Bedrock...'
        
        # Run the async workflow
        asyncio.run(run_workflow_async(workflow_id, document))
        
    except Exception as e:
        logger.error(f"Error in background workflow: {str(e)}")
        workflow_results[workflow_id]['status'] = 'error'
        workflow_results[workflow_id]['message'] = f'Workflow failed: {str(e)}'

async def run_workflow_async(workflow_id, document):
    """Execute the Temporal workflow with Amazon Bedrock AI."""
    try:
        logger.info(f"Connecting to Temporal for workflow {workflow_id}")
        
        # Update progress
        workflow_results[workflow_id]['progress'] = 20
        workflow_results[workflow_id]['message'] = 'Executing Amazon Bedrock AI workflow...'
        
        # Connect to Temporal
        client = await Client.connect("localhost:7233")
        
        # Execute workflow with Amazon Bedrock AI
        logger.info(f"Executing workflow {workflow_id} with Amazon Bedrock AI")
        result = await client.execute_workflow(
            MedicalCodingWorkflow.run,
            document,
            id=workflow_id,
            task_queue="medical-coding-task-queue"
        )
        
        # Update with successful result
        workflow_results[workflow_id]['status'] = 'completed'
        workflow_results[workflow_id]['progress'] = 100
        workflow_results[workflow_id]['message'] = 'Processing completed successfully'
        workflow_results[workflow_id]['result'] = result
        
        logger.info(f"Workflow {workflow_id} completed successfully")
        logger.info(f"Result keys: {list(result.keys()) if result else 'No result'}")
        
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {str(e)}")
        workflow_results[workflow_id]['status'] = 'error'
        workflow_results[workflow_id]['message'] = f'Workflow execution failed: {str(e)}'

@app.route('/api/workflow-status/<workflow_id>')
def get_workflow_status(workflow_id):
    """Get the status of a workflow."""
    try:
        if workflow_id not in workflow_results:
            return jsonify({'error': 'Workflow not found'}), 404
        
        result = workflow_results[workflow_id]
        
        # Update progress based on status
        if result['status'] == 'processing':
            if result['progress'] < 30:
                result['progress'] = min(result['progress'] + 5, 30)
                result['message'] = 'Starting document analysis with Amazon Bedrock AI...'
            elif result['progress'] < 60:
                result['progress'] = min(result['progress'] + 3, 60)
                result['message'] = 'Generating ICD-10 codes with AI...'
            elif result['progress'] < 90:
                result['progress'] = min(result['progress'] + 2, 90)
                result['message'] = 'Validating codes and generating report...'
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting workflow status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sample-documents')
def get_sample_documents():
    """Get sample medical documents for testing."""
    samples = [
        {
            "name": "Chest Pain Case",
            "content": "Patient presents with acute chest pain and shortness of breath. EKG shows ST elevation. Diagnosis: Acute myocardial infarction. Procedure: Cardiac catheterization with stent placement. Patient stabilized and transferred to cardiac care unit.",
            "type": "emergency_consultation"
        },
        {
            "name": "Diabetes Management",
            "content": "Follow-up visit for Type 2 diabetes mellitus. Patient reports improved blood glucose control. Current medications: Metformin 500mg twice daily, Glipizide 5mg daily. Blood pressure: 140/90 mmHg. A1C: 7.2%. Plan: Continue current medications, lifestyle modifications.",
            "type": "follow_up"
        },
        {
            "name": "Pneumonia Case",
            "content": "Patient admitted with community-acquired pneumonia. Chest X-ray shows right lower lobe infiltrate. Vital signs: Temperature 101.2°F, Heart rate 95 bpm, Blood pressure 135/85 mmHg, Oxygen saturation 94%. Treatment: IV antibiotics, oxygen therapy, chest physiotherapy.",
            "type": "inpatient_admission"
        }
    ]
    return jsonify(samples)

if __name__ == '__main__':
    print("🏥 Medical Coding System - Web UI")
    print("=" * 50)
    print("Starting Flask application...")
    print("Access the UI at: http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000) 