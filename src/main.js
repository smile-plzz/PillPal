document.addEventListener('DOMContentLoaded', () => {
    console.log("Medicine Tracker App initialized");

    // Global variables
    let medicines = [];
    let medicationHistory = [];
    let currentEditingMedicineId = null;
    let settings = {
        enableNotifications: false,
        autoSave: true,
        defaultReminder: 10
    };

    // DOM Elements
    const elements = {
        // Forms and inputs
        medicineForm: document.getElementById('medicine-form'),
        medicineNameInput: document.getElementById('medicine-name'),
        autocompleteSuggestions: document.getElementById('autocomplete-suggestions'),
        addMedicineButton: document.getElementById('add-medicine-submit-button'),
        timeInputs: document.getElementById('time-inputs'),
        addTimeBtn: document.getElementById('add-time-btn'),
        
        // Patient and doctor info
        patientNameInput: document.getElementById('patient-name'),
        patientDobInput: document.getElementById('patient-dob'),
        patientContactInput: document.getElementById('patient-contact'),
        patientAllergiesInput: document.getElementById('patient-allergies'),
        doctorNameInput: document.getElementById('doctor-name'),
        doctorContactInput: document.getElementById('doctor-contact'),
        
        // Schedule and table
        scheduleTableBody: document.querySelector('#schedule-table tbody'),
        emptyScheduleMessage: document.getElementById('empty-schedule'),
        searchMedicineInput: document.getElementById('search-medicine'),
        filterTimeSelect: document.getElementById('filter-time'),
        
        // Stats dashboard
        totalMedicines: document.getElementById('total-medicines'),
        todayDoses: document.getElementById('today-doses'),
        adherenceRate: document.getElementById('adherence-rate'),
        nextDose: document.getElementById('next-dose'),
        
        // Buttons
        downloadPdfButton: document.getElementById('download-pdf'),
        exportDataButton: document.getElementById('export-data'),
        resetScheduleButton: document.getElementById('reset-schedule'),
        infoButton: document.getElementById('info-button'),
        settingsButton: document.getElementById('settings-button'),
        
        // Modals
        infoModal: document.getElementById('info-modal'),
        settingsModal: document.getElementById('settings-modal'),
        closeModalButton: document.getElementById('close-modal'),
        closeSettingsButton: document.getElementById('close-settings'),
        saveSettingsButton: document.getElementById('save-settings'),
        
        // Settings inputs
        enableNotificationsCheckbox: document.getElementById('enable-notifications'),
        autoSaveCheckbox: document.getElementById('auto-save'),
        defaultReminderSelect: document.getElementById('default-reminder'),
        
        // History
        medicationHistoryContainer: document.getElementById('medication-history'),
        
        // Notifications
        notificationContainer: document.getElementById('notification-container'),
        themeToggle: document.getElementById('theme-toggle'),
        importDataButton: document.getElementById('import-data'),
        importFileInput: document.getElementById('import-file')
    };

    // Initialize the application
    function init() {
        loadData();
        setupEventListeners();
        renderSchedule();
        updateDashboard();
        renderMedicationHistory();
        checkForUpcomingDoses();
        startReminderCheck();
        registerServiceWorker();
    }

    // Register service worker for offline functionality
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            const swUrl = new URL('./sw.js', import.meta.url);
            navigator.serviceWorker.register(swUrl)
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Data management functions
    function saveData() {
        try {
            localStorage.setItem('medicineSchedule', JSON.stringify(medicines));
            localStorage.setItem('medicationHistory', JSON.stringify(medicationHistory));
            localStorage.setItem('patientInfo', JSON.stringify(getPatientInfo()));
            localStorage.setItem('settings', JSON.stringify(settings));
            console.log('Data saved successfully');
        } catch (error) {
            console.error('Failed to save data:', error);
            showNotification('Failed to save data', 'error');
        }
    }

    function loadData() {
        try {
            medicines = JSON.parse(localStorage.getItem('medicineSchedule')) || [];
            medicationHistory = JSON.parse(localStorage.getItem('medicationHistory')) || [];
            settings = { ...settings, ...JSON.parse(localStorage.getItem('settings')) };
            loadPatientInfo();
            loadSettings();
        } catch (error) {
            console.error('Failed to load data:', error);
            medicines = [];
            medicationHistory = [];
        }
    }

    function getPatientInfo() {
        return {
            name: elements.patientNameInput.value,
            dob: elements.patientDobInput.value,
            contact: elements.patientContactInput.value,
            allergies: elements.patientAllergiesInput.value,
            doctorName: elements.doctorNameInput.value,
            doctorContact: elements.doctorContactInput.value
        };
    }

    function loadPatientInfo() {
        const savedPatientInfo = JSON.parse(localStorage.getItem('patientInfo'));
        if (savedPatientInfo) {
            elements.patientNameInput.value = savedPatientInfo.name || '';
            elements.patientDobInput.value = savedPatientInfo.dob || '';
            elements.patientContactInput.value = savedPatientInfo.contact || '';
            elements.patientAllergiesInput.value = savedPatientInfo.allergies || '';
            elements.doctorNameInput.value = savedPatientInfo.doctorName || '';
            elements.doctorContactInput.value = savedPatientInfo.doctorContact || '';
        }
    }

    function loadSettings() {
        elements.enableNotificationsCheckbox.checked = settings.enableNotifications;
        elements.autoSaveCheckbox.checked = settings.autoSave;
        elements.defaultReminderSelect.value = settings.defaultReminder;
    }

    // Event listeners setup
    function setupEventListeners() {
        // Form events
        elements.medicineForm.addEventListener('submit', handleMedicineSubmit);
        elements.addTimeBtn.addEventListener('click', addTimeInput);
        
        // Patient info auto-save
        [elements.patientNameInput, elements.patientDobInput, elements.patientContactInput, 
         elements.patientAllergiesInput, elements.doctorNameInput, elements.doctorContactInput]
            .forEach(input => input.addEventListener('input', () => {
                if (settings.autoSave) saveData();
            }));

        // Search and filter
        elements.searchMedicineInput.addEventListener('input', debounce(filterSchedule, 300));
        elements.filterTimeSelect.addEventListener('change', filterSchedule);

        // Button events
        elements.downloadPdfButton.addEventListener('click', generatePDF);
        elements.exportDataButton.addEventListener('click', exportData);
        elements.resetScheduleButton.addEventListener('click', resetSchedule);
        elements.infoButton.addEventListener('click', () => elements.infoModal.classList.remove('hidden'));
        elements.settingsButton.addEventListener('click', () => elements.settingsModal.classList.remove('hidden'));
        elements.closeModalButton.addEventListener('click', () => elements.infoModal.classList.add('hidden'));
        elements.closeSettingsButton.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
        elements.saveSettingsButton.addEventListener('click', saveSettings);

        // Theme toggle
        elements.themeToggle?.addEventListener('click', toggleTheme);

        // Import data
        elements.importDataButton?.addEventListener('click', () => elements.importFileInput.click());
        elements.importFileInput?.addEventListener('change', handleImportFile);

        // Modal close on outside click
        [elements.infoModal, elements.settingsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });

        // Autocomplete
        elements.medicineNameInput.addEventListener('input', debounce(fetchAutocompleteSuggestions, 300));
        elements.autocompleteSuggestions.addEventListener('click', handleAutocompleteClick);

        // Settings
        elements.enableNotificationsCheckbox.addEventListener('change', (e) => {
            settings.enableNotifications = e.target.checked;
            if (e.target.checked) requestNotificationPermission();
        });
    }

    // Utility functions
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type} slide-in`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        elements.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Time input management
    function createTimeInput() {
        const div = document.createElement('div');
        div.className = 'flex items-center';
        div.innerHTML = `
            <input type="time" class="form-input flex-1" name="medicine-time" required>
            <button type="button" class="ml-2 text-red-500 hover:text-red-700 text-xl" aria-label="Remove time input" onclick="removeTimeInput(this)">&times;</button>
        `;
        return div;
    }

    function addTimeInput() {
        elements.timeInputs.appendChild(createTimeInput());
    }

    window.removeTimeInput = (button) => {
        button.parentElement.remove();
    };

    // Autocomplete functionality
    async function fetchAutocompleteSuggestions() {
        const query = elements.medicineNameInput.value.trim();
        if (query.length < 3) {
            elements.autocompleteSuggestions.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`);
            const data = await response.json();

            const suggestions = data.drugGroup?.drugList?.drug?.map(d => d.name) || [];
            renderAutocomplete(suggestions.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        }
    }

    function renderAutocomplete(suggestions) {
        if (suggestions.length === 0) {
            elements.autocompleteSuggestions.style.display = 'none';
            return;
        }
        
        elements.autocompleteSuggestions.innerHTML = suggestions
            .map(s => `<div class="p-2 hover:bg-gray-200 cursor-pointer">${s}</div>`)
            .join('');
        elements.autocompleteSuggestions.style.display = 'block';
    }

    function handleAutocompleteClick(e) {
        if (e.target.tagName === 'DIV') {
            elements.medicineNameInput.value = e.target.textContent;
            elements.autocompleteSuggestions.style.display = 'none';
        }
    }

    // Medicine management
    async function handleMedicineSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) return;

        const formData = getFormData();
        elements.addMedicineButton.disabled = true;
        elements.addMedicineButton.innerHTML = '<span class="loading-indicator"></span> Processing...';

        try {
            if (currentEditingMedicineId) {
                await updateMedicine(currentEditingMedicineId, formData);
                showNotification('Medicine updated successfully!', 'success');
            } else {
                await addMedicine(formData);
                showNotification('Medicine added successfully!', 'success');
            }
            
            resetForm();
            renderSchedule();
            updateDashboard();
        } catch (error) {
            console.error('Error handling medicine submission:', error);
            showNotification('Failed to save medicine', 'error');
        } finally {
            elements.addMedicineButton.disabled = false;
            elements.addMedicineButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Medicine';
        }
    }

    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

        // Validate medicine name
        const medicineName = elements.medicineNameInput.value.trim();
        if (!medicineName) {
            showFieldError(elements.medicineNameInput, 'Medicine name is required');
            isValid = false;
        }

        // Validate times
        const timeInputs = document.querySelectorAll('input[name="medicine-time"]');
        const validTimes = Array.from(timeInputs).map(input => input.value).filter(Boolean);
        if (validTimes.length === 0) {
            showFieldError(timeInputs[0], 'At least one time is required');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(input, message) {
        input.classList.add('invalid');
        const error = document.createElement('p');
        error.className = 'error-message';
        error.textContent = message;
        input.parentElement.appendChild(error);
    }

    function getFormData() {
        const timeInputs = document.querySelectorAll('input[name="medicine-time"]');
        const times = Array.from(timeInputs).map(input => input.value).filter(Boolean);
        
        return {
            name: elements.medicineNameInput.value.trim(),
            times: times,
            duration: document.getElementById('medicine-duration').value || null,
            dosage: document.getElementById('medicine-dosage').value || '',
            instructions: document.getElementById('medicine-instructions').value || '',
            reminder: document.getElementById('medicine-reminder').value || settings.defaultReminder
        };
    }

    async function addMedicine(formData) {
        const medicineInfo = await fetchMedicineInfo(formData.name);
        const newMedicine = {
            id: crypto.randomUUID(),
            ...formData,
            info: medicineInfo,
            createdAt: new Date().toISOString(),
            taken: []
        };
        
        medicines.push(newMedicine);
        addToHistory('added', newMedicine);
        saveData();
    }

    async function updateMedicine(id, formData) {
        const index = medicines.findIndex(m => m.id === id);
        if (index !== -1) {
            const medicineInfo = await fetchMedicineInfo(formData.name);
            const oldMedicine = medicines[index];
            medicines[index] = {
                ...oldMedicine,
                ...formData,
                info: medicineInfo,
                updatedAt: new Date().toISOString()
            };
            addToHistory('updated', medicines[index]);
            saveData();
        }
        currentEditingMedicineId = null;
    }

    async function fetchMedicineInfo(medicineName) {
        try {
            const response = await fetch(`https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(medicineName)}`);
            const data = await response.json();

            if (data.drugGroup?.drugList?.drug) {
                const rxcui = data.drugGroup.drugList.drug[0].rxcui;
                const propertiesResponse = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allproperties.json?prop=ALL`);
                const propertiesData = await propertiesResponse.json();

                const properties = propertiesData.propConceptGroup?.propConcept;
                return {
                    usage: properties?.find(p => p.propName === 'DEFINITIONAL_FEATURES')?.propValue || 'N/A',
                    category: properties?.find(p => p.propName === 'Drug Class')?.propValue || 'N/A',
                    genericName: properties?.find(p => p.propName === 'RxNorm Name')?.propValue || 'N/A'
                };
            }
        } catch (error) {
            console.error('Failed to fetch medicine info:', error);
        }
        return { usage: 'N/A', category: 'N/A', genericName: 'N/A' };
    }

    function resetForm() {
        elements.medicineForm.reset();
        elements.timeInputs.innerHTML = '';
        elements.timeInputs.appendChild(createTimeInput());
        currentEditingMedicineId = null;
        elements.addMedicineButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Medicine';
    }

    // Schedule rendering
    function renderSchedule() {
        const scheduleItems = [];
        medicines.forEach(medicine => {
            medicine.times.forEach(time => {
                scheduleItems.push({ ...medicine, time });
            });
        });

        const sortedSchedule = scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
        renderScheduleTable(sortedSchedule);
        updateEmptyState(sortedSchedule.length === 0);
    }

    function renderScheduleTable(scheduleItems) {
        elements.scheduleTableBody.innerHTML = '';
        
        scheduleItems.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 fade-in';
            
            const status = getDoseStatus(item);
            const statusClass = status === 'taken' ? 'text-green-600' : 
                              status === 'overdue' ? 'text-red-600' : 'text-yellow-600';
            const statusIcon = status === 'taken' ? 'fa-check-circle' : 
                             status === 'overdue' ? 'fa-exclamation-circle' : 'fa-clock';
            
            row.innerHTML = `
                <td data-label="Time" class="px-4 py-2 text-sm font-medium text-gray-900">${item.time}</td>
                <td data-label="Medicine" class="px-4 py-2 text-sm text-gray-900">${item.name}</td>
                <td data-label="Dosage" class="px-4 py-2 text-sm text-gray-500">${item.dosage || 'N/A'}</td>
                <td data-label="Instructions" class="px-4 py-2 text-sm text-gray-500">${item.instructions || 'N/A'}</td>
                <td data-label="Status" class="px-4 py-2 text-sm">
                    <span class="${statusClass}">
                        <i class="fas ${statusIcon} mr-1"></i>${status}
                    </span>
                </td>
                <td data-label="Actions" class="px-4 py-2 text-right text-sm font-medium">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-2" onclick="editMedicine('${item.id}')" aria-label="Edit medicine">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="text-green-600 hover:text-green-900 mr-2" onclick="markAsTaken('${item.id}', '${item.time}')" aria-label="Mark as taken">
                        <i class="fas fa-check"></i> Taken
                    </button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteMedicine('${item.id}')" aria-label="Delete medicine">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            elements.scheduleTableBody.appendChild(row);
        });
    }

    function getDoseStatus(medicine) {
        const today = new Date().toDateString();
        const doseTime = new Date();
        const [hours, minutes] = medicine.time.split(':');
        doseTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const takenToday = medicine.taken.some(taken => 
            new Date(taken.date).toDateString() === today && taken.time === medicine.time
        );
        
        if (takenToday) return 'taken';
        if (doseTime < new Date()) return 'overdue';
        return 'pending';
    }

    function updateEmptyState(isEmpty) {
        if (isEmpty) {
            elements.emptyScheduleMessage.style.display = 'block';
            elements.downloadPdfButton.disabled = true;
            elements.exportDataButton.disabled = true;
        } else {
            elements.emptyScheduleMessage.style.display = 'none';
            elements.downloadPdfButton.disabled = false;
            elements.exportDataButton.disabled = false;
        }
    }

    // Search and filter
    function filterSchedule() {
        const searchTerm = elements.searchMedicineInput.value.toLowerCase();
        const timeFilter = elements.filterTimeSelect.value;
        
        const filteredMedicines = medicines.filter(medicine => {
            const matchesSearch = medicine.name.toLowerCase().includes(searchTerm);
            const matchesTime = !timeFilter || isTimeInPeriod(medicine.times, timeFilter);
            return matchesSearch && matchesTime;
        });
        
        const scheduleItems = [];
        filteredMedicines.forEach(medicine => {
            medicine.times.forEach(time => {
                scheduleItems.push({ ...medicine, time });
            });
        });
        
        const sortedSchedule = scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
        renderScheduleTable(sortedSchedule);
    }

    function isTimeInPeriod(times, period) {
        return times.some(time => {
            const [hours] = time.split(':').map(Number);
            switch (period) {
                case 'morning': return hours >= 6 && hours < 12;
                case 'afternoon': return hours >= 12 && hours < 17;
                case 'evening': return hours >= 17 && hours < 21;
                case 'night': return hours >= 21 || hours < 6;
                default: return true;
            }
        });
    }

    // Dashboard updates
    function updateDashboard() {
        elements.totalMedicines.textContent = medicines.length;
        elements.todayDoses.textContent = getTodayDosesCount();
        elements.adherenceRate.textContent = calculateAdherenceRate() + '%';
        elements.nextDose.textContent = getNextDoseTime();
    }

    function getTodayDosesCount() {
        const today = new Date().toDateString();
        return medicines.reduce((count, medicine) => {
            return count + medicine.times.length;
        }, 0);
    }

    function calculateAdherenceRate() {
        if (medicines.length === 0) return 0;
        
        const today = new Date().toDateString();
        const totalDoses = medicines.reduce((count, medicine) => count + medicine.times.length, 0);
        const takenDoses = medicines.reduce((count, medicine) => {
            return count + medicine.taken.filter(taken => 
                new Date(taken.date).toDateString() === today
            ).length;
        }, 0);
        
        return Math.round((takenDoses / totalDoses) * 100) || 0;
    }

    function getNextDoseTime() {
        const now = new Date();
        const today = now.toDateString();
        
        let nextDose = null;
        medicines.forEach(medicine => {
            medicine.times.forEach(time => {
                const doseTime = new Date();
                const [hours, minutes] = time.split(':');
                doseTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                const takenToday = medicine.taken.some(taken => 
                    new Date(taken.date).toDateString() === today && taken.time === time
                );
                
                if (!takenToday && doseTime > now && (!nextDose || doseTime < nextDose)) {
                    nextDose = doseTime;
                }
            });
        });
        
        return nextDose ? nextDose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
    }

    // Medication history
    function addToHistory(action, medicine) {
        const historyItem = {
            id: crypto.randomUUID(),
            action,
            medicineName: medicine.name,
            timestamp: new Date().toISOString(),
            details: action === 'added' ? 'Medicine added to schedule' : 'Medicine updated'
        };
        
        medicationHistory.unshift(historyItem);
        if (medicationHistory.length > 50) {
            medicationHistory = medicationHistory.slice(0, 50);
        }
        
        renderMedicationHistory();
    }

    function renderMedicationHistory() {
        elements.medicationHistoryContainer.innerHTML = '';
        
        if (medicationHistory.length === 0) {
            elements.medicationHistoryContainer.innerHTML = `
                <p class="text-gray-500 text-center py-4">No medication history yet</p>
            `;
            return;
        }
        
        medicationHistory.slice(0, 10).forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
            historyElement.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-${item.action === 'added' ? 'plus' : 'edit'} text-blue-600 mr-3"></i>
                    <div>
                        <p class="text-sm font-medium text-gray-900">${item.medicineName}</p>
                        <p class="text-xs text-gray-500">${item.details}</p>
                    </div>
                </div>
                <span class="text-xs text-gray-400">${new Date(item.timestamp).toLocaleDateString()}</span>
            `;
            elements.medicationHistoryContainer.appendChild(historyElement);
        });
    }

    // Global functions for table actions
    window.editMedicine = (id) => {
        const medicine = medicines.find(m => m.id === id);
        if (medicine) {
            currentEditingMedicineId = id;
            elements.medicineNameInput.value = medicine.name;
            document.getElementById('medicine-duration').value = medicine.duration || '';
            document.getElementById('medicine-dosage').value = medicine.dosage || '';
            document.getElementById('medicine-instructions').value = medicine.instructions || '';
            document.getElementById('medicine-reminder').value = medicine.reminder || settings.defaultReminder;
            
            elements.timeInputs.innerHTML = '';
            medicine.times.forEach(time => {
                const timeInput = createTimeInput();
                timeInput.querySelector('input[name="medicine-time"]').value = time;
                elements.timeInputs.appendChild(timeInput);
            });
            
            elements.addMedicineButton.innerHTML = '<i class="fas fa-save mr-2"></i>Update Medicine';
        }
    };

    window.deleteMedicine = (id) => {
        if (confirm('Are you sure you want to delete this medicine?')) {
            const medicine = medicines.find(m => m.id === id);
        medicines = medicines.filter(m => m.id !== id);
            addToHistory('deleted', medicine);
            saveData();
        renderSchedule();
            updateDashboard();
            showNotification('Medicine deleted successfully', 'success');
        }
    };

    window.markAsTaken = (id, time) => {
        const medicine = medicines.find(m => m.id === id);
        if (medicine) {
            const today = new Date().toISOString().split('T')[0];
            const takenEntry = { date: today, time: time };
            
            // Remove existing entry for this time today if exists
            medicine.taken = medicine.taken.filter(taken => 
                !(taken.date === today && taken.time === time)
            );
            
            // Add new entry
            medicine.taken.push(takenEntry);
            saveData();
            renderSchedule();
            updateDashboard();
            showNotification('Dose marked as taken', 'success');
        }
    };

    // Settings management
    function saveSettings() {
        settings.enableNotifications = elements.enableNotificationsCheckbox.checked;
        settings.autoSave = elements.autoSaveCheckbox.checked;
        settings.defaultReminder = elements.defaultReminderSelect.value;
        
        saveData();
        elements.settingsModal.classList.add('hidden');
        showNotification('Settings saved successfully', 'success');
    }

    // Theme management
    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }

    function updateThemeIcon(isDark) {
        if (!elements.themeToggle) return;
        const icon = elements.themeToggle.querySelector('i');
        if (!icon) return;
        icon.className = isDark ? 'fas fa-sun mr-2' : 'fas fa-moon mr-2';
    }

    // On load, apply saved theme
    (function applySavedTheme() {
        const saved = localStorage.getItem('theme');
        const isDark = saved === 'dark';
        if (isDark) document.documentElement.classList.add('dark');
        updateThemeIcon(isDark);
    })();

    // Import data
    function handleImportFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result);
                if (json.medicines && Array.isArray(json.medicines)) {
                    medicines = json.medicines;
                }
                if (json.patientInfo) {
                    elements.patientNameInput.value = json.patientInfo.name || '';
                    elements.patientDobInput.value = json.patientInfo.dob || '';
                    elements.patientContactInput.value = json.patientInfo.contact || '';
                    elements.patientAllergiesInput.value = json.patientInfo.allergies || '';
                }
                saveData();
                renderSchedule();
                updateDashboard();
                showNotification('Data imported successfully', 'success');
            } catch (e) {
                showNotification('Invalid import file', 'error');
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be re-imported if needed
        event.target.value = '';
    }

    // Notification system
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification('Notifications enabled', 'success');
                } else {
                    showNotification('Notification permission denied', 'error');
                    elements.enableNotificationsCheckbox.checked = false;
                }
            });
        }
    }

    function checkForUpcomingDoses() {
        if (!settings.enableNotifications) return;
        
        const now = new Date();
        const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
        
        medicines.forEach(medicine => {
            medicine.times.forEach(time => {
                const doseTime = new Date();
                const [hours, minutes] = time.split(':');
                doseTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                if (doseTime > now && doseTime <= in5Minutes) {
                    showBrowserNotification(medicine.name, time);
                }
            });
        });
    }

    function showBrowserNotification(medicineName, time) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Medicine Reminder', {
                body: `Time to take ${medicineName} at ${time}`,
                icon: '/favicon.ico'
            });
        }
    }

    function startReminderCheck() {
        setInterval(checkForUpcomingDoses, 60000); // Check every minute
    }

    // Export functionality
    function exportData() {
        const data = {
            medicines,
            patientInfo: getPatientInfo(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medicine-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Data exported successfully', 'success');
    }

    // Reset functionality
    function resetSchedule() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            medicines = [];
            medicationHistory = [];
            localStorage.clear();
            renderSchedule();
            updateDashboard();
            renderMedicationHistory();
            showNotification('All data cleared', 'success');
        }
    }

    // PDF Generation (enhanced)
    function generatePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Medication Schedule', 105, 25, null, null, 'center');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated by Medicine Tracker App', 105, 32, null, null, 'center');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 180, 40, null, null, 'right');

        let yOffset = 50;

        // Patient Information
        const patientInfo = getPatientInfo();
        if (patientInfo.name || patientInfo.dob || patientInfo.contact || patientInfo.allergies) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Patient Information:', 20, yOffset);
        yOffset += 5;
            
            const patientData = [
                ['Name', patientInfo.name || 'N/A'],
                ['Date of Birth', patientInfo.dob || 'N/A'],
                ['Contact', patientInfo.contact || 'N/A'],
                ['Allergies', patientInfo.allergies || 'N/A']
            ];
            
        doc.autoTable({
            startY: yOffset,
                body: patientData,
            theme: 'grid',
                styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 'auto' } },
            margin: { left: 20, right: 20 },
            didDrawPage: function (data) {
                    yOffset = data.cursor.y + 10;
            }
        });
        }

        // Doctor Information
        if (patientInfo.doctorName || patientInfo.doctorContact) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Doctor Information:', 20, yOffset);
            yOffset += 5;
            
            const doctorData = [
                ['Name', patientInfo.doctorName || 'N/A'],
                ['Contact', patientInfo.doctorContact || 'N/A']
            ];
            
            doc.autoTable({
                startY: yOffset,
                body: doctorData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 'auto' } },
                margin: { left: 20, right: 20 },
                didDrawPage: function (data) {
                    yOffset = data.cursor.y + 10;
                }
            });
        }

        // Medicine Schedule
        const scheduleItems = [];
        medicines.forEach(medicine => {
            medicine.times.forEach(time => {
                scheduleItems.push({ ...medicine, time });
            });
        });

        const sortedSchedule = scheduleItems.sort((a, b) => a.time.localeCompare(b.time));

        if (sortedSchedule.length > 0) {
            yOffset += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Medication Schedule:', 20, yOffset);
            yOffset += 5;

            const tableHeaders = ['Time', 'Medicine', 'Dosage', 'Instructions', 'Duration'];
            const tableRows = sortedSchedule.map(item => [
                item.time,
                item.name,
                item.dosage || 'N/A',
                item.instructions || 'N/A',
                item.duration || 'Indefinite'
            ]);

        doc.autoTable({
                head: [tableHeaders],
            body: tableRows,
            startY: yOffset,
            theme: 'striped',
                headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                bodyStyles: { fontSize: 8, cellPadding: 2 },
            margin: { top: 10, right: 10, bottom: 25, left: 10 },
            didDrawPage: function (data) {
                // Footer
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                const pageHeight = doc.internal.pageSize.height;
                doc.text('Disclaimer: Consult your doctor before making changes to your medication schedule.', 10, pageHeight - 15);
                doc.text(`Generated on ${new Date().toLocaleString()}`, data.settings.margin.left, pageHeight - 10);
            }
        });
        }

        doc.save(`medication_schedule_${new Date().toISOString().slice(0, 10)}.pdf`);
        showNotification('PDF generated successfully', 'success');
    }

    // Initialize the application
    init();
});
