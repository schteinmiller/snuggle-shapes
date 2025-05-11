// DOM элементы
const canvas = document.getElementById('pattern-canvas');
const generateBtn = document.getElementById('generate-btn');
const exportBtn = document.getElementById('export-btn');
const exportContainer = document.getElementById('export-container');
const exportCode = document.getElementById('export-code');
const copyBtn = document.getElementById('copy-btn');
const sizeSlider = document.getElementById('size-slider');

// Массив для хранения созданных фигур
let shapes = [];

// Массив доступных фигур
const shapeIds = ['shape-0', 'shape-I', 'shape-J', 'shape-O', 'shape-U'];

// Базовый размер для фигур одинакового размера
const baseSize = 70;

// Диапазон размеров для случайных фигур
const minSize = 40;
const maxSize = 100;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Генерируем паттерн при загрузке страницы
    generatePattern();
    
    // Обработчики событий
    generateBtn.addEventListener('click', generatePattern);
    exportBtn.addEventListener('click', exportSVG);
    copyBtn.addEventListener('click', copyToClipboard);
    sizeSlider.addEventListener('input', generatePattern);
});

// Генерация паттерна с 5 фигурами
function generatePattern() {
    // Очищаем холст перед генерацией
    clearCanvas();
    
    // Получаем значение ползунка размера (0-100)
    const sizeVariation = sizeSlider.value;
    
    // Генерируем 5 фигур
    for (let i = 0; i < 5; i++) {
        // Создаем фигуру со случайными параметрами
        const shape = createShape(sizeVariation);
        shapes.push(shape);
        
        // Добавляем фигуру на холст
        canvas.appendChild(shape);
    }
}

// Создание фигуры с учётом настройки размера
function createShape(sizeVariation) {
    // Создаем элемент использования символа
    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    // Выбираем случайную фигуру из доступных
    const randomIndex = Math.floor(Math.random() * shapeIds.length);
    const shapeId = shapeIds[randomIndex];
    
    // Устанавливаем ссылку на определение символа
    useElement.setAttribute('href', `#${shapeId}`);
    
    // Генерируем случайное положение
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 400);
    
    // Определяем размер в зависимости от значения ползунка
    // 0 = все одинакового размера, 100 = полностью случайные размеры
    let size;
    if (sizeVariation == 0) {
        // Одинаковый размер для всех фигур
        size = baseSize;
    } else if (sizeVariation == 100) {
        // Полностью случайный размер
        size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    } else {
        // Промежуточное значение - ограниченная вариативность размера
        // Чем ближе к 0, тем ближе к baseSize
        const variation = (maxSize - minSize) * (sizeVariation / 100);
        const minAllowedSize = Math.max(minSize, baseSize - variation/2);
        const maxAllowedSize = Math.min(maxSize, baseSize + variation/2);
        size = Math.floor(Math.random() * (maxAllowedSize - minAllowedSize)) + minAllowedSize;
    }
    
    // Устанавливаем положение и размер
    useElement.setAttribute('x', x);
    useElement.setAttribute('y', y);
    useElement.setAttribute('width', size);
    useElement.setAttribute('height', size);
    
    // Генерируем случайный поворот
    const rotation = Math.floor(Math.random() * 360);
    useElement.setAttribute('transform', `rotate(${rotation} ${x + size/2} ${y + size/2})`);
    
    // Генерируем случайный цвет
    const color = getRandomColor();
    useElement.setAttribute('fill', color);
    
    return useElement;
}

// Генерация случайного цвета
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

// Очистка холста
function clearCanvas() {
    // Удаляем все фигуры, кроме определений (defs)
    shapes.forEach(shape => {
        if (shape.parentNode === canvas) {
            canvas.removeChild(shape);
        }
    });
    
    // Очищаем массив фигур
    shapes = [];
}

// Экспорт SVG
function exportSVG() {
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
    
    // Копируем все фигуры
    shapes.forEach(shape => {
        const shapeClone = shape.cloneNode(true);
        svgCopy.appendChild(shapeClone);
    });
    
    // Преобразуем SVG в строку
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgCopy);
    
    // Показываем контейнер экспорта
    exportContainer.style.display = 'flex';
    
    // Устанавливаем код SVG в текстовое поле
    exportCode.value = svgString;
}

// Копирование кода в буфер обмена
function copyToClipboard() {
    // Выделяем текст в поле
    exportCode.select();
    
    // Копируем в буфер обмена
    document.execCommand('copy');
}
