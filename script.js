// Telegram Mini App Data Viewer
class TelegramDataViewer {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.data = {
            user: null,
            chat: null,
            theme: null,
            app: null,
            raw: null
        };
        this.init();
    }

    init() {
        this.updateTimestamp();
        this.setupEventListeners();
        
        if (this.tg) {
            this.loadTelegramData();
            this.setupTelegramUI();
        } else {
            this.showDemoMode();
        }
        
        // Загружаем сохраненные данные
        this.loadSavedData();
        
        // Обновляем данные каждые 5 секунд
        setInterval(() => this.updateData(), 5000);
    }

    setupEventListeners() {
        // Обработчик изменения темы
        if (this.tg) {
            this.tg.onEvent('themeChanged', () => {
                this.updateThemeData();
                this.showToast('Тема изменена!');
            });

            this.tg.onEvent('viewportChanged', (event) => {
                this.updateViewportData(event);
            });
        }

        // Сохранение данных перед закрытием
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    async loadTelegramData() {
        try {
            // Показываем статус загрузки
            this.updateStatus('connected', 'Подключено к Telegram ✅');
            
            // Раскрываем приложение на весь экран
            this.tg.expand();
            
            // Получаем все данные
            this.data = {
                user: this.tg.initDataUnsafe?.user || null,
                chat: this.tg.initDataUnsafe?.chat || null,
                theme: this.tg.themeParams || {},
                app: {
                    platform: this.tg.platform,
                    version: this.tg.version,
                    colorScheme: this.tg.colorScheme,
                    viewportHeight: this.tg.viewportHeight,
                    viewportStableHeight: this.tg.viewportStableHeight,
                    isExpanded: this.tg.isExpanded,
                    headerColor: this.tg.headerColor,
                    backgroundColor: this.tg.backgroundColor
                },
                raw: {
                    initData: this.tg.initData,
                    initDataUnsafe: this.tg.initDataUnsafe,
                    themeParams: this.tg.themeParams,
                    platform: this.tg.platform
                }
            };

            // Обновляем интерфейс
            this.updateUI();
            
            // Сохраняем данные
            this.saveData();
            
            // Показываем уведомление
            this.showToast('Данные Telegram загружены!');
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.updateStatus('error', 'Ошибка загрузки данных ❌');
            this.showToast('Ошибка загрузки данных', 'error');
        }
    }

    updateUI() {
        // Обновляем данные пользователя
        if (this.data.user) {
            document.getElementById('userId').textContent = this.data.user.id || '—';
            document.getElementById('userFirstName').textContent = this.data.user.first_name || '—';
            document.getElementById('userLastName').textContent = this.data.user.last_name || '—';
            document.getElementById('userUsername').textContent = this.data.user.username ? '@' + this.data.user.username : '—';
            document.getElementById('userLanguage').textContent = this.data.user.language_code || '—';
            document.getElementById('authDate').textContent = this.tg.initDataUnsafe?.auth_date ? 
                new Date(this.tg.initDataUnsafe.auth_date * 1000).toLocaleString() : '—';
        }

        // Обновляем данные чата
        if (this.data.chat) {
            document.getElementById('chatId').textContent = this.data.chat.id || '—';
            document.getElementById('chatType').textContent = this.data.chat.type || '—';
            document.getElementById('chatTitle').textContent = this.data.chat.title || '—';
            document.getElementById('chatUsername').textContent = this.data.chat.username ? '@' + this.data.chat.username : '—';
        }

        // Обновляем параметры приложения
        document.getElementById('platform').textContent = this.data.app.platform || '—';
        document.getElementById('version').textContent = this.data.app.version || '—';
        document.getElementById('colorScheme').textContent = this.data.app.colorScheme || '—';
        document.getElementById('viewportHeight').textContent = this.data.app.viewportHeight || '—';
        document.getElementById('viewportStableHeight').textContent = this.data.app.viewportStableHeight || '—';

        // Обновляем параметры темы
        this.updateThemeColors();
        
        // Обновляем raw данные
        this.updateRawData();
    }

    updateThemeColors() {
        const theme = this.data.theme || {};
        const colorKeys = [
            'bg_color', 'text_color', 'hint_color', 
            'link_color', 'button_color', 'button_text_color'
        ];
        
        colorKeys.forEach(key => {
            const elementId = key.replace('_', '');
            const valueElement = document.getElementById(elementId);
            const previewElement = document.getElementById(elementId + 'Preview');
            
            if (valueElement && previewElement) {
                const color = theme[key] || '#000000';
                valueElement.textContent = color;
                previewElement.style.backgroundColor = color;
                previewElement.title = color;
            }
        });
    }

    updateRawData() {
        const rawDataElement = document.getElementById('rawData');
        if (rawDataElement && this.data.raw) {
            rawDataElement.textContent = JSON.stringify(this.data.raw, null, 2);
        }
    }

    updateStatus(status, message) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (statusDot) {
            statusDot.className = 'status-dot';
            if (status === 'connected') {
                statusDot.classList.add('connected');
            }
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }

    updateTimestamp() {
        const updateTimeElement = document.getElementById('updateTime');
        if (updateTimeElement) {
            updateTimeElement.textContent = new Date().toLocaleString();
        }
    }

    updateData() {
        if (this.tg) {
            this.data.app.viewportHeight = this.tg.viewportHeight;
            this.data.app.viewportStableHeight = this.tg.viewportStableHeight;
            
            document.getElementById('viewportHeight').textContent = this.data.app.viewportHeight;
            document.getElementById('viewportStableHeight').textContent = this.data.app.viewportStableHeight;
            
            this.updateTimestamp();
        }
    }

    updateThemeData() {
        if (this.tg) {
            this.data.theme = this.tg.themeParams;
            this.updateThemeColors();
        }
    }

    updateViewportData(event) {
        console.log('Viewport changed:', event);
        this.updateData();
    }

    showDemoMode() {
        this.updateStatus('disconnected', 'Режим демо (не в Telegram)');
        
        // Показываем демо данные
        this.data = {
            user: {
                id: 123456789,
                first_name: 'Демо',
                last_name: 'Пользователь',
                username: 'demo_user',
                language_code: 'ru'
            },
            chat: {
                id: -1001234567890,
                type: 'group',
                title: 'Демо чат',
                username: 'demo_chat'
            },
            theme: {
                bg_color: '#18222d',
                text_color: '#ffffff',
                hint_color: '#999999',
                link_color: '#8774e1',
                button_color: '#8774e1',
                button_text_color: '#ffffff'
            },
            app: {
                platform: 'tdesktop',
                version: '7.0',
                colorScheme: 'dark',
                viewportHeight: 640,
                viewportStableHeight: 640,
                isExpanded: true
            },
            raw: {
                demo: true,
                message: 'Это демо данные. Запустите через Telegram для реальных данных.'
            }
        };

        this.updateUI();
        this.showToast('Запущен демо режим', 'warning');
    }

    saveData() {
        try {
            const dataToSave = {
                ...this.data,
                timestamp: Date.now(),
                source: this.tg ? 'telegram' : 'demo'
            };
            
            localStorage.setItem('telegramAppData', JSON.stringify(dataToSave));
            console.log('Данные сохранены в localStorage');
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('telegramAppData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                console.log('Загружены сохраненные данные:', parsedData);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    showToast(message, type = 'info') {
        // Создаем toast уведомление
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Добавляем стили
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'error' ? '#f56565' : type === 'warning' ? '#ed8936' : '#48bb78'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(toast);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    setupTelegramUI() {
        // Настраиваем главную кнопку
        this.tg.MainButton.text = "📊 Обновить данные";
        this.tg.MainButton.color = "#8774e1";
        this.tg.MainButton.textColor = "#ffffff";
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(() => {
            this.loadTelegramData();
        });

        // Настраиваем кнопку Назад
        this.tg.BackButton.show();
        this.tg.BackButton.onClick(() => {
            history.back();
        });

        // Устанавливаем цвета
        this.tg.setHeaderColor('#8774e1');
        this.tg.setBackgroundColor('#18222d');
    }
}

// Глобальные функции для кнопок
function checkTelegramConnection() {
    window.dataViewer?.loadTelegramData();
}

function copyRawData() {
    const rawData = document.getElementById('rawData');
    if (rawData) {
        navigator.clipboard.writeText(rawData.textContent)
            .then(() => {
                const viewer = window.dataViewer;
                viewer?.showToast('JSON скопирован в буфер!');
            })
            .catch(err => {
                console.error('Ошибка копирования:', err);
                window.dataViewer?.showToast('Ошибка копирования', 'error');
            });
    }
}

function downloadData() {
    const viewer = window.dataViewer;
    if (!viewer?.data) return;
    
    const dataStr = JSON.stringify(viewer.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `telegram-data-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    viewer?.showToast('Данные скачаны!');
}

function clearData() {
    if (confirm('Удалить все сохраненные данные?')) {
        localStorage.removeItem('telegramAppData');
        window.dataViewer?.showToast('Данные очищены', 'warning');
        
        // Перезагружаем страницу
        setTimeout(() => location.reload(), 1000);
    }
}

function sendTestData() {
    const viewer = window.dataViewer;
    if (viewer?.tg) {
        const testData = {
            action: 'test',
            timestamp: Date.now(),
            random: Math.random()
        };
        
        viewer.tg.sendData(JSON.stringify(testData));
        viewer.tg.showAlert('Тестовые данные отправлены!');
        viewer.showToast('Данные отправлены в бота');
    } else {
        alert('Запустите через Telegram для отправки данных');
    }
}

function showAlert() {
    const viewer = window.dataViewer;
    if (viewer?.tg) {
        viewer.tg.showAlert('Привет от Telegram Mini App! 🚀');
    } else {
        alert('Привет из демо режима! 🎮');
    }
}

function toggleExpanded() {
    const viewer = window.dataViewer;
    if (viewer?.tg) {
        if (viewer.tg.isExpanded) {
            // Здесь не можем сжать, но можем показать сообщение
            viewer.tg.showAlert('Приложение уже развернуто на весь экран');
        } else {
            viewer.tg.expand();
            viewer.showToast('Приложение развернуто');
        }
    } else {
        alert('В демо режиме нельзя управлять размером экрана');
    }
}

function closeApp() {
    const viewer = window.dataViewer;
    if (viewer?.tg) {
        if (confirm('Закрыть приложение?')) {
            viewer.tg.close();
        }
    } else {
        if (confirm('Выйти из демо режима?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Добавляем CSS анимации для toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.dataViewer = new TelegramDataViewer();
    
    // Добавляем анимацию загрузки
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});