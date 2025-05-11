// Глобальные переменные
let selectedShape = 'shape-0'; // Фигура по умолчанию
let shapes = []; // Массив для хранения созданных фигур

// DOM элементы
const canvas = document.getElementById('pattern-canvas');
const generateBtn = document.getElementById('generate-btn');
const exportBtn = document.getElementById('export-btn');
const clearBtn = document.getElementById('clear-btn');
const shapeCountInput = document.getElementById('shape-count');
const minSizeInput = document.getElementById('min-size');
const maxSizeInput = document.getElementById('max-size');
const colorModeSelect = document.getElementById('color-mode');
const exportContainer = document.getElementById('export-container');
const exportCode = document.getElementById('export-code');
const copyBtn = document.getElementById('copy-btn');
const shapeBtns = document.querySelectorAll('.shape-btn');

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initShapeSelector();
    attachEventListeners();
});

// Инициализация селектора фигур
function initShapeSelector() {
    shapeBtns.forEach(btn => {
        // Применяем активный класс к первой фигуре по умолчанию
        if (btn.dataset.shape === selectedShape) {
            btn.classList.add('active');
        }
    });
}

// Присоединяем обработчики событий
function attachEventListeners() {
    // Обработчики для кнопок выбора фигур
    shapeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Удаляем активный класс у всех кнопок
            shapeBtns.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс к нажатой кнопке
            btn.classList.add('active');
            // Обновляем выбранную фигуру
            selectedShape = btn.dataset.shape;
        });
    });

    // Обработчик для кнопки генерации
    generateBtn.addEventListener('click', generatePattern);

    // Обработчик для кнопки экспорта
    exportBtn.addEventListener('click', exportSVG);

    // Обработчик для кнопки очистки
    clearBtn.addEventListener('click', clearCanvas);

    // Обработчик для кнопки копирования
    copyBtn.addEventListener('click', copyToClipboard);
}

// Генерация случайного паттерна
function generatePattern() {
    // Очищаем холст перед генерацией
    clearCanvas();
    
    // Скрываем контейнер экспорта, если он был виден
    exportContainer.style.display = 'none';
    
    // Получаем значения параметров
    const count = parseInt(shapeCountInput.value) || 5;
    const minSize = parseInt(minSizeInput.value) || 20;
    const maxSize = parseInt(maxSizeInput.value) || 40;
    const colorMode = colorModeSelect.value;
    
    // Ограничиваем количество фигур
    const limitedCount = Math.min(Math.max(count, 1), 50);
    
    // Генерируем фигуры
    for (let i = 0; i < limitedCount; i++) {
        // Создаем фигуру с случайными параметрами
        const shape = createRandomShape(minSize, maxSize, colorMode, i, limitedCount);
        shapes.push(shape);
        
        // Добавляем фигуру на холст
        canvas.appendChild(shape);
    }
}

// Создание случайной фигуры
function createRandomShape(minSize, maxSize, colorMode, index, totalCount) {
    // Создаем элемент использования символа
    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    // Получаем случайную фигуру или используем выбранную
    const shapeId = useRandomShape();
    
    // Устанавливаем ссылку на определение символа
    useElement.setAttribute('href', `#${shapeId}`);
    
    // Генерируем случайное положение (с учетом размера фигуры)
    const size = getRandomSize(minSize, maxSize);
    const x = getRandomPosition(0, 480 - size);
    const y = getRandomPosition(0, 480 - size);
    
    // Устанавливаем положение и размер
    useElement.setAttribute('x', x);
    useElement.setAttribute('y', y);
    useElement.setAttribute('width', size);
    useElement.setAttribute('height', size);
    
    // Генерируем случайный поворот
    const rotation = getRandomRotation();
    
    // Применяем поворот вокруг центра фигуры
    useElement.setAttribute('transform', `rotate(${rotation} ${x + size/2} ${y + size/2})`);
    
    // Генерируем цвет в зависимости от режима
    const color = getColor(colorMode, index, totalCount);
    useElement.setAttribute('fill', color);
    
    // Добавляем случайную прозрачность
    useElement.setAttribute('opacity', getRandomOpacity());
    
    return useElement;
}

// Случайный выбор фигуры (с приоритетом выбранной пользователем)
function useRandomShape() {
    // С вероятностью 70% используем выбранную пользователем фигуру
    if (Math.random() < 0.7) {
        return selectedShape;
    }
    
    // Иначе выбираем случайную фигуру из доступных
    const shapeIds = ['shape-0', 'shape-I', 'shape-J', 'shape-O', 'shape-U'];
    const randomIndex = Math.floor(Math.random() * shapeIds.length);
    return shapeIds[randomIndex];
}

// Генерация случайного размера
function getRandomSize(min, max) {
    // Преобразуем проценты в пиксели (относительно размера холста 480px)
    const minPx = (min / 100) * 480;
    const maxPx = (max / 100) * 480;
    return Math.floor(Math.random() * (maxPx - minPx + 1)) + minPx;
}

// Генерация случайной позиции
function getRandomPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Генерация случайного поворота
function getRandomRotation() {
    return Math.floor(Math.random() * 360);
}

// Генерация случайной прозрачности
function getRandomOpacity() {
    // Возвращаем значение от 0.5 до 1
    return (Math.random() * 0.5 + 0.5).toFixed(2);
}

// Получение цвета в зависимости от режима
function getColor(mode, index, total) {
    switch (mode) {
        case 'monochrome':
            // Оттенки одного цвета
            const baseHue = Math.floor(Math.random() * 360); // Базовый оттенок
            const saturation = 70 + Math.floor(Math.random() * 30); // Насыщенность от 70% до 100%
            const lightness = 40 + Math.floor(Math.random() * 40); // Яркость от 40% до 80%
            return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
            
        case 'gradient':
            // Градиент цветов
            const startHue = 0; // Начальный оттенок
            const endHue = 360; // Конечный оттенок
            const step = (endHue - startHue) / (total || 1);
            const hue = startHue + (step * index);
            return `hsl(${hue}, 80%, 60%)`;
            
        case 'random':
        default:
            // Полностью случайные цвета
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgb(${r}, ${g}, ${b})`;
    }
}

// Очистка холста
function clearCanvas() {
    // Удаляем все фигуры, кроме определений
    shapes.forEach(shape => {
        if (shape.parentNode === canvas) {
            canvas.removeChild(shape);
        }
    });
    
    // Очищаем массив фигур
    shapes = [];
    
    // Скрываем контейнер экспорта
    exportContainer.style.display = 'none';
}

// Экспорт SVG
function exportSVG() {
    // Если нет фигур, нечего экспортировать
    if (shapes.length === 0) {
        alert('Сначала сгенерируйте паттерн!');
        return;
    }
    
    // Создаем копию текущего SVG для экспорта
    const svgCopy = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgCopy.setAttribute('viewBox', '0 0 480 480');
    svgCopy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgCopy.setAttribute('width', '480');
    svgCopy.setAttribute('height', '480');
    
    // Копируем определения символов (defs)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const originalDefs = canvas.querySelector('defs');
    defs.innerHTML = originalDefs.innerHTML;
    svgCopy.appendChild(defs);
    
    // Добавляем фон, если нужно
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#f9f9f9');
    svgCopy.appendChild(background);
    
    // Копируем все фигуры
    shapes.forEach(shape => {
        const shapeClone = shape.cloneNode(true);
        svgCopy.appendChild(shapeClone);
    });
    
    // Преобразуем SVG в строку
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgCopy);
    
    // Добавляем заголовок XML
    svgString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' + svgString;
    
    // Показываем контейнер экспорта
    exportContainer.style.display = 'flex';
    
    // Устанавливаем код SVG в текстовое поле
    exportCode.value = svgString;
}

// Копирование кода в буфер обмена
function copyToClipboard() {
    // Выделяем текст в поле
    exportCode.select();
    exportCode.setSelectionRange(0, 99999); // Для мобильных устройств
    
    // Копируем в буфер обмена
    try {
        document.execCommand('copy');
        // Кратковременно меняем текст кнопки для обратной связи
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    } catch (err) {
        alert('Не удалось скопировать: ' + err);
    }
}
