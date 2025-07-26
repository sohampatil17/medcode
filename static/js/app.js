// Medical Coding System - JavaScript

class MedicalCodingUI {
    constructor() {
        this.currentWorkflowId = null;
        this.statusCheckInterval = null;
        this.sampleDocuments = [];
        
        this.initializeEventListeners();
        this.loadSampleDocuments();
    }
    
    initializeEventListeners() {
        // Form submission
        document.getElementById('documentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processDocument();
        });
        
        // Sample document buttons
        document.querySelectorAll('[onclick^="loadSample"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
                this.loadSampleDocument(index);
            });
        });
    }
    
    async loadSampleDocuments() {
        try {
            const response = await fetch('/api/sample-documents');
            this.sampleDocuments = await response.json();
        } catch (error) {
            console.error('Failed to load sample documents:', error);
        }
    }
    
    loadSampleDocument(index) {
        if (this.sampleDocuments[index]) {
            const sample = this.sampleDocuments[index];
            document.getElementById('patientName').value = sample.name.split(' ')[0] + ' ' + sample.name.split(' ')[1];
            document.getElementById('documentType').value = sample.type;
            document.getElementById('documentContent').value = sample.content;
            
            // Show success message
            this.showToast('Sample document loaded successfully!', 'success');
        }
    }
    
    async processDocument() {
        const patientName = document.getElementById('patientName').value.trim();
        const documentType = document.getElementById('documentType').value;
        const documentContent = document.getElementById('documentContent').value.trim();
        
        if (!documentContent) {
            this.showToast('Please enter document content', 'error');
            return;
        }
        
        // Show loading state
        this.showProgress();
        this.disableForm();
        
        try {
            const response = await fetch('/api/process-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_name: patientName || 'Unknown',
                    document_type: documentType,
                    content: documentContent
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.currentWorkflowId = data.workflow_id;
                this.startStatusChecking();
                this.showToast('Document processing started!', 'success');
            } else {
                throw new Error(data.error || 'Failed to start processing');
            }
            
        } catch (error) {
            this.showError(error.message);
            this.hideProgress();
            this.enableForm();
        }
    }
    
    startStatusChecking() {
        console.log('=== STARTING STATUS CHECKING ===');
        this.statusCheckInterval = setInterval(() => {
            this.checkWorkflowStatus();
        }, 2000); // Check every 2 seconds
        
        // Set a timeout to stop checking after 5 minutes
        this.statusCheckTimeout = setTimeout(() => {
            console.log('=== STATUS CHECK TIMEOUT ===');
            this.stopStatusChecking();
            this.showError('Processing timed out. Please try again.');
            this.enableForm();
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    async checkWorkflowStatus() {
        if (!this.currentWorkflowId) {
            console.log('No workflow ID set, skipping status check');
            return;
        }
        
        try {
            console.log(`=== STATUS CHECK FOR WORKFLOW: ${this.currentWorkflowId} ===`);
            
            const response = await fetch(`/api/workflow-status/${this.currentWorkflowId}`);
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('=== STATUS CHECK RESPONSE ===');
            console.log('Full response data:', JSON.stringify(data, null, 2));
            console.log('Status:', data.status);
            console.log('Progress:', data.progress);
            console.log('Message:', data.message);
            console.log('Has result:', !!data.result);
            console.log('Result keys:', data.result ? Object.keys(data.result) : 'No result');
            
            // Update progress regardless of status
            this.updateProgress(data);
            
            // Handle different statuses
            if (data.status === 'completed') {
                console.log('=== WORKFLOW COMPLETED ===');
                if (data.result) {
                    console.log('Result found, calling showResults...');
                    this.showResults(data.result);
                } else {
                    console.log('No result in completed workflow');
                    this.showError('Workflow completed but no results were generated');
                }
                this.stopStatusChecking();
                this.enableForm();
                
            } else if (data.status === 'error') {
                console.log('=== WORKFLOW ERROR ===');
                console.error('Workflow error:', data.message);
                this.showError(data.message || 'An error occurred during processing');
                this.stopStatusChecking();
                this.enableForm();
                
            } else if (data.status === 'processing') {
                console.log('=== WORKFLOW STILL PROCESSING ===');
                console.log('Progress:', data.progress + '%');
                console.log('Message:', data.message);
                // Continue checking - don't stop
                
            } else {
                console.log('=== UNKNOWN STATUS ===');
                console.log('Unknown workflow status:', data.status);
                // Continue checking for now
            }
            
        } catch (error) {
            console.error('=== STATUS CHECK ERROR ===');
            console.error('Error checking workflow status:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            // Don't stop checking on network errors, just log them
            // Only stop if it's a persistent error
            if (error.message.includes('404') || error.message.includes('not found')) {
                console.log('Workflow not found, stopping checks');
                this.showError('Workflow not found. Please try again.');
                this.stopStatusChecking();
                this.enableForm();
            }
        }
    }
    
    updateProgress(data) {
        const progressBar = document.getElementById('progressBar');
        const progressMessage = document.getElementById('progressMessage');
        const progressDetails = document.getElementById('progressDetails');
        
        progressBar.style.width = `${data.progress}%`;
        progressMessage.textContent = data.message;
        
        if (data.progress > 0) {
            progressDetails.textContent = `Progress: ${data.progress}%`;
        }
    }
    
    showResults(result) {
        console.log('=== SHOW RESULTS CALLED ===');
        console.log('Raw result:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', Object.keys(result || {}));
        
        this.hideProgress();
        this.hideInitialState();
        this.hideError();
        
        // Handle different result structures
        let diagnosisCodes = [];
        let procedureCodes = [];
        let totalCodes = 0;
        let overallConfidence = 0;
        let qualityMetrics = {};
        let aiModel = 'Unknown';
        let processingTime = 0;
        
        // Check if result is a dict-like object or has different structure
        if (result && typeof result === 'object') {
            console.log('Processing result object...');
            
            // Try different possible structures - be more flexible
            diagnosisCodes = result.diagnosis_codes || result.diagnoses || [];
            procedureCodes = result.procedure_codes || result.procedures || [];
            overallConfidence = result.overall_confidence || result.confidence || 0;
            qualityMetrics = result.quality_metrics || result.quality || {};
            aiModel = result.ai_model || result.model || 'Claude 3.5 Sonnet (Amazon Bedrock)';
            processingTime = result.processing_time_seconds || result.processing_time || 0;
            
            console.log('Extracted data:');
            console.log('- Diagnosis codes:', diagnosisCodes);
            console.log('- Procedure codes:', procedureCodes);
            console.log('- Overall confidence:', overallConfidence);
            console.log('- Quality metrics:', qualityMetrics);
            console.log('- AI model:', aiModel);
            console.log('- Processing time:', processingTime);
        }
        
        totalCodes = diagnosisCodes.length + procedureCodes.length;
        console.log('Total codes:', totalCodes);
        
        // Update summary cards with better formatting
        const totalCodesElement = document.getElementById('totalCodes');
        const confidenceElement = document.getElementById('confidenceScore');
        
        if (totalCodesElement) {
            totalCodesElement.textContent = totalCodes;
            console.log('Updated total codes element:', totalCodes);
        } else {
            console.error('totalCodes element not found!');
        }
        
        if (confidenceElement) {
            confidenceElement.textContent = `${(overallConfidence * 100).toFixed(1)}%`;
            console.log('Updated confidence element:', `${(overallConfidence * 100).toFixed(1)}%`);
        } else {
            console.error('confidenceScore element not found!');
        }
        
        // Update diagnosis codes
        this.displayCodes('diagnosisCodes', diagnosisCodes, 'diagnosis');
        
        // Update procedure codes
        this.displayCodes('procedureCodes', procedureCodes, 'procedure');
        
        // Update quality metrics with better formatting
        const codeAccuracy = qualityMetrics.code_accuracy || qualityMetrics.completeness_score || qualityMetrics.accuracy || 0;
        const complianceScore = qualityMetrics.compliance_score || qualityMetrics.compliance || 0;
        
        const qualityElement = document.getElementById('qualityScore');
        const complianceElement = document.getElementById('complianceScore');
        
        if (qualityElement) {
            qualityElement.textContent = `${codeAccuracy.toFixed(1)}%`;
            console.log('Updated quality element:', `${codeAccuracy.toFixed(1)}%`);
        } else {
            console.error('qualityScore element not found!');
        }
        
        if (complianceElement) {
            complianceElement.textContent = `${complianceScore.toFixed(1)}%`;
            console.log('Updated compliance element:', `${complianceScore.toFixed(1)}%`);
        } else {
            console.error('complianceScore element not found!');
        }
        
        // Update AI model info with better formatting
        const aiModelElement = document.getElementById('aiModel');
        const processingTimeElement = document.getElementById('processingTime');
        
        if (aiModelElement) {
            aiModelElement.textContent = aiModel;
            console.log('Updated AI model element:', aiModel);
        } else {
            console.error('aiModel element not found!');
        }
        
        if (processingTimeElement) {
            processingTimeElement.textContent = `${processingTime.toFixed(2)} seconds`;
            console.log('Updated processing time element:', `${processingTime.toFixed(2)} seconds`);
        } else {
            console.error('processingTime element not found!');
        }
        
        // Show results with animation
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.classList.add('fade-in');
            console.log('Showed results section');
        } else {
            console.error('resultsSection element not found!');
        }
        
        // Show success message with more details
        const message = totalCodes > 0 
            ? `Successfully processed document with ${totalCodes} codes generated!`
            : 'Document processed, but no codes were generated.';
        this.showToast(message, totalCodes > 0 ? 'success' : 'warning');
        
        console.log('=== SHOW RESULTS COMPLETED ===');
    }
    
    // Test function to manually trigger result display
    testShowResults() {
        console.log('=== TESTING SHOW RESULTS ===');
        const testResult = {
            diagnosis_codes: [
                {
                    code: "I21.9",
                    description: "Acute myocardial infarction, unspecified",
                    confidence: 0.95,
                    category: "Diseases of the circulatory system",
                    primary: true
                }
            ],
            procedure_codes: [
                {
                    code: "4A023N6",
                    description: "Percutaneous Coronary Intervention",
                    confidence: 0.9,
                    category: "Measurement, Cardiovascular",
                    primary: true
                }
            ],
            overall_confidence: 0.925,
            quality_metrics: {
                code_accuracy: 92.5,
                compliance_score: 100
            },
            ai_model: "Claude 3.5 Sonnet (Amazon Bedrock)",
            processing_time_seconds: 4.23
        };
        this.showResults(testResult);
    }
    
    displayCodes(containerId, codes, type) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        
        container.innerHTML = '';
        
        if (!codes || codes.length === 0) {
            container.innerHTML = '<div class="text-muted text-center py-3">No codes found</div>';
            return;
        }
        
        console.log(`Displaying ${codes.length} ${type} codes:`, codes);
        
        codes.forEach((code, index) => {
            const codeElement = document.createElement('div');
            codeElement.className = 'list-group-item code-item';
            
            // Handle different code structures
            const codeValue = code.code || code.id || `CODE-${index + 1}`;
            const description = code.description || code.name || code.condition || 'No description available';
            const confidence = code.confidence || 0.8;
            const category = code.category || 'General';
            const isPrimary = code.primary || false;
            
            const confidenceClass = this.getConfidenceClass(confidence);
            const categoryClass = this.getCategoryClass(category);
            
            codeElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="code-number">${codeValue}</div>
                        <div class="code-description">${description}</div>
                        <div class="mt-2">
                            <span class="category-badge ${categoryClass}">${category}</span>
                            <span class="code-confidence ${confidenceClass}">${(confidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div class="ms-3">
                        ${isPrimary ? '<span class="badge bg-warning">Primary</span>' : ''}
                    </div>
                </div>
            `;
            
            container.appendChild(codeElement);
        });
    }
    
    getConfidenceClass(confidence) {
        if (confidence >= 0.9) return 'bg-success';
        if (confidence >= 0.7) return 'bg-warning';
        return 'bg-danger';
    }
    
    getCategoryClass(category) {
        const categoryMap = {
            'Endocrine': 'category-endocrine',
            'Cardiovascular': 'category-cardiovascular',
            'Respiratory': 'category-respiratory',
            'Surgical': 'category-surgical',
            'Diagnostic': 'category-diagnostic',
            'Measurement': 'category-measurement'
        };
        return categoryMap[category] || '';
    }
    
    showProgress() {
        document.getElementById('progressSection').style.display = 'block';
        document.getElementById('initialState').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }
    
    hideProgress() {
        document.getElementById('progressSection').style.display = 'none';
    }
    
    hideInitialState() {
        document.getElementById('initialState').style.display = 'none';
    }
    
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorSection').style.display = 'block';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('initialState').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
    }
    
    hideError() {
        document.getElementById('errorSection').style.display = 'none';
    }
    
    disableForm() {
        document.getElementById('processBtn').disabled = true;
        document.getElementById('processBtn').innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        document.getElementById('documentForm').classList.add('loading');
    }
    
    enableForm() {
        document.getElementById('processBtn').disabled = false;
        document.getElementById('processBtn').innerHTML = '<i class="fas fa-play me-2"></i>Process Document';
        document.getElementById('documentForm').classList.remove('loading');
    }
    
    stopStatusChecking() {
        console.log('=== STOPPING STATUS CHECKING ===');
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
        if (this.statusCheckTimeout) {
            clearTimeout(this.statusCheckTimeout);
            this.statusCheckTimeout = null;
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add to page
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        container.appendChild(toast);
        document.body.appendChild(container);
        
        // Show toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove after hidden
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(container);
        });
    }

    // Manual trigger for testing
    manualCheckStatus() {
        console.log('=== MANUAL STATUS CHECK ===');
        if (this.currentWorkflowId) {
            this.checkWorkflowStatus();
        } else {
            console.log('No workflow ID set');
        }
    }

    // Force display results for testing
    forceDisplayResults() {
        console.log('=== FORCE DISPLAY RESULTS ===');
        fetch('/api/workflow-status/web-DOC-20250725-498cc664-1753491198')
            .then(response => response.json())
            .then(data => {
                console.log('Force display data:', data);
                if (data.status === 'completed' && data.result) {
                    this.showResults(data.result);
                } else {
                    console.log('No completed result available');
                }
            })
            .catch(error => {
                console.error('Force display error:', error);
            });
    }
}

// Initialize the UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.medicalCodingUI = new MedicalCodingUI();
});

// Global function for sample loading (for onclick attributes)
function loadSample(index) {
    if (window.medicalCodingUI) {
        window.medicalCodingUI.loadSampleDocument(index);
    }
}

// Global test function to manually test result display
function testResults() {
    console.log('=== GLOBAL TEST FUNCTION CALLED ===');
    if (window.medicalCodingUI) {
        window.medicalCodingUI.testShowResults();
    } else {
        console.error('Medical coding UI not initialized!');
    }
}

// Global function to test with real workflow result
function testWithRealResult() {
    console.log('=== TESTING WITH REAL WORKFLOW RESULT ===');
    fetch('/api/workflow-status/web-DOC-20250725-498cc664-1753491198')
        .then(response => response.json())
        .then(data => {
            console.log('Real workflow result:', data);
            if (data.status === 'completed' && data.result) {
                if (window.medicalCodingUI) {
                    window.medicalCodingUI.showResults(data.result);
                } else {
                    console.error('Medical coding UI not initialized!');
                }
            } else {
                console.log('Workflow not completed or no result');
            }
        })
        .catch(error => {
            console.error('Error fetching real result:', error);
        });
}

// Global function to manually check status
function manualCheckStatus() {
    if (window.medicalCodingUI) {
        window.medicalCodingUI.manualCheckStatus();
    } else {
        console.error('Medical coding UI not initialized!');
    }
}

// Global function to force display results
function forceDisplayResults() {
    if (window.medicalCodingUI) {
        window.medicalCodingUI.forceDisplayResults();
    } else {
        console.error('Medical coding UI not initialized!');
    }
}

// Global function to test the complete flow
function testCompleteFlow() {
    console.log('=== TESTING COMPLETE FLOW ===');
    
    // Step 1: Submit a new document
    const testData = {
        patient_name: "Test Patient",
        document_type: "consultation",
        content: "Patient presents with chest pain. Diagnosis: Acute myocardial infarction. Procedure: Cardiac catheterization."
    };
    
    fetch('/api/process-document', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Workflow started:', data);
        if (data.workflow_id) {
            console.log('Workflow ID:', data.workflow_id);
            // Set the workflow ID and start checking
            if (window.medicalCodingUI) {
                window.medicalCodingUI.currentWorkflowId = data.workflow_id;
                window.medicalCodingUI.startStatusChecking();
            }
        }
    })
    .catch(error => {
        console.error('Error starting workflow:', error);
    });
} 

// Demo function to show Temporal results directly
function demoTemporalResults() {
    console.log('=== DEMO TEMPORAL RESULTS ===');
    
    // Use the completed workflow result we know exists
    fetch('/api/workflow-status/web-DOC-20250725-498cc664-1753491198')
        .then(response => response.json())
        .then(data => {
            console.log('Demo data:', data);
            if (data.status === 'completed' && data.result) {
                if (window.medicalCodingUI) {
                    window.medicalCodingUI.showResults(data.result);
                    showToast('✅ Amazon Bedrock AI workflow results displayed!', 'success');
                } else {
                    console.error('Medical coding UI not initialized!');
                    showToast('❌ UI not initialized', 'error');
                }
            } else {
                console.log('No completed result available');
                showToast('❌ No completed Amazon Bedrock AI workflow found', 'error');
            }
        })
        .catch(error => {
            console.error('Demo error:', error);
            showToast('❌ Error loading Amazon Bedrock AI results: ' + error.message, 'error');
        });
}

// Demo function to start a new workflow
function demoNewWorkflow() {
    console.log('=== DEMO NEW AMAZON BEDROCK AI WORKFLOW ===');
    
    const testData = {
        patient_name: "Demo Patient",
        document_type: "consultation",
        content: "Patient presents with chest pain and shortness of breath. Diagnosis: Acute myocardial infarction. Procedure: Cardiac catheterization with stent placement."
    };
    
    showToast('🚀 Starting new Amazon Bedrock AI workflow...', 'info');
    
    fetch('/api/process-document', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('New Amazon Bedrock AI workflow started:', data);
        if (data.workflow_id) {
            showToast('✅ Amazon Bedrock AI workflow started! ID: ' + data.workflow_id, 'success');
            
            // Wait a bit then check the result
            setTimeout(() => {
                checkDemoWorkflow(data.workflow_id);
            }, 10000); // Wait 10 seconds
        }
    })
    .catch(error => {
        console.error('Error starting Amazon Bedrock AI workflow:', error);
        showToast('❌ Error starting Amazon Bedrock AI workflow: ' + error.message, 'error');
    });
}

// Check demo workflow result
function checkDemoWorkflow(workflowId) {
    console.log('=== CHECKING DEMO WORKFLOW ===', workflowId);
    
    fetch(`/api/workflow-status/${workflowId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Demo workflow status:', data);
            if (data.status === 'completed' && data.result) {
                if (window.medicalCodingUI) {
                    window.medicalCodingUI.showResults(data.result);
                    showToast('✅ New workflow completed!', 'success');
                }
            } else if (data.status === 'processing') {
                showToast('⏳ Workflow still processing...', 'info');
                // Check again in 5 seconds
                setTimeout(() => checkDemoWorkflow(workflowId), 5000);
            } else {
                showToast('❌ Workflow failed or not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error checking workflow:', error);
            showToast('❌ Error checking workflow: ' + error.message, 'error');
        });
}

// Clear results
function clearResults() {
    console.log('=== CLEARING RESULTS ===');
    
    // Hide results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    
    // Reset form
    const form = document.getElementById('medicalForm');
    if (form) {
        form.reset();
    }
    
    // Show initial state
    if (window.medicalCodingUI) {
        window.medicalCodingUI.showInitialState();
    }
    
    showToast('🧹 Results cleared!', 'info');
}

// Simple toast function
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toastContainer.removeChild(toast);
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
} 