// DOM элементы
const canvas = document.getElementById('pattern-canvas');
const generateBtn = document.getElementById('generate-btn');
const exportBtn = document.getElementById('export-btn');
const exportContainer = document.getElementById('export-container');
const exportCode = document.getElementById('export-code');
const copyBtn = document.getElementById('copy-btn');
const sizeSlider = document.getElementById('size-slider');
const spacingSlider = document.getElementById('spacing-slider');

// Массив для хранения созданных фигур
let shapes = [];

// Массив доступных фигур
const shapeIds = ['shape-0', 'shape-I', 'shape-J', 'shape-O', 'shape-U'];

// Базовый размер для фигур одинакового размера
const baseSize = 70;

// Диапазон размеров для случайных фигур
const minSize = 40;
const maxSize = 100;

// Максимальное количество попыток размещения фигуры
const maxPlacementAttempts = 50;

// Границы холста
const canvasBounds = {
    width: 480,
    height: 480
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Генерируем паттерн при загрузке страницы
    generatePattern();
    
    // Обработчики событий
    generateBtn.addEventListener('click', generatePattern);
    exportBtn.addEventListener('click', exportSVG);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Обработчики событий для ползунков
    sizeSlider.addEventListener('input', generatePattern);
    spacingSlider.addEventListener('input', generatePattern);
});

// Генерация паттерна с 5 фигурами
function generatePattern() {
    // Очищаем холст перед генерацией
    clearCanvas();
    
    // Получаем значения ползунков
    const sizeVariation = parseInt(sizeSlider.value);
    const spacingValue = parseInt(spacingSlider.value);
    
    // Массив для хранения размещенных фигур и их защитных полей
    const placedShapes = [];
    
    // Генерируем 5 фигур
    for (let i = 0; i < 5; i++) {
        // Попытка разместить фигуру с учетом защитного поля
        const shape = placeShape(sizeVariation, spacingValue, placedShapes);
        
        // Если фигуру удалось разместить, добавляем ее
        if (shape) {
            shapes.push(shape);
            canvas.appendChild(shape);
            
            // Сохраняем информацию о размещенной фигуре для проверки перекрытий
            const bounds = getShapeBounds(shape, spacingValue);
            placedShapes.push(bounds);
        }
    }
}

// Размещение фигуры с учетом защитного поля
function placeShape(sizeVariation, spacingValue, placedShapes) {
    // Определение размера на основе вариации размеров
    let size = determineSize(sizeVariation);
    
    // Попытки разместить фигуру без перекрытий (или с допустимым перекрытием)
    let attempts = 0;
    let validPosition = false;
    let x, y, shapeBounds;
    
    // Выбираем случайную фигуру из доступных
    const randomIndex = Math.floor(Math.random() * shapeIds.length);
    const shapeId = shapeIds[randomIndex];
    
    // Повторяем попытки размещения, пока не найдем валидную позицию или не исчерпаем лимит попыток
    while (!validPosition && attempts < maxPlacementAttempts) {
        // Генерируем случайное положение
        x = Math.floor(Math.random() * (canvasBounds.width - size));
        y = Math.floor(Math.random() * (canvasBounds.height - size));
        
        // Определяем границы фигуры с учетом защитного поля
        shapeBounds = {
            x: x,
            y: y,
            width: size,
            height: size,
            spacing: spacingValue
        };
        
        // Проверяем перекрытие с уже размещенными фигурами
        validPosition = isValidPosition(shapeBounds, placedShapes, spacingValue);
        
        attempts++;
    }
    
    // Если достигнут предел попыток и позиция не найдена, просто размещаем фигуру где угодно
    if (!validPosition && attempts >= maxPlacementAttempts) {
        console.log("Достигнут предел попыток размещения. Размещаем фигуру произвольно.");
    }
    
    // Создаем элемент использования символа
    const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    
    // Устанавливаем ссылку на определение символа
    useElement.setAttribute('href', `#${shapeId}`);
    
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

// Определение размера фигуры на основе значения ползунка размеров
function determineSize(sizeVariation) {
    // 0 = все одинакового размера, 100 = полностью случайные размеры
    let size;
    
    if (sizeVariation === 0) {
        // Одинаковый размер для всех фигур
        size = baseSize;
    } else if (sizeVariation === 100) {
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
    
    return size;
}

// Проверка валидности позиции с учетом защитного поля
function isValidPosition(newShape, placedShapes, spacingValue) {
    // Положительный spacing - нужен отступ
    // Отрицательный spacing - разрешено перекрытие
    
    // Если spacing отрицательный, всегда разрешаем размещение
    if (spacingValue <= -100) {
        return true; // Полное перекрытие разрешено
    }
    
    // Для каждой уже размещенной фигуры
    for (const shape of placedShapes) {
        // Получаем границы с учетом защитного поля
        const effectiveNewShape = adjustBoundsForSpacing(newShape, spacingValue);
        const effectiveShape = adjustBoundsForSpacing(shape, spacingValue);
        
        // Проверяем перекрытие границ
        if (checkOverlap(effectiveNewShape, effectiveShape, spacingValue)) {
            return false; // Найдено перекрытие, позиция невалидна
        }
    }
    
    // Если нет перекрытий, позиция валидна
    return true;
}

// Корректировка границ с учетом защитного поля
function adjustBoundsForSpacing(shape, spacingValue) {
    // Масштабируем spacing от -100..100 к реальному размеру отступа
    // При spacingValue = 100, отступ = размеру фигуры
    // При spacingValue = 0, отступ = 0
    // При spacingValue = -100, отступ = -100% размера фигуры (полное перекрытие)
    
    const spacingFactor = spacingValue / 100;
    const spacingAmount = shape.width * spacingFactor;
    
    // Вычисляем эффективные границы с учетом защитного поля
    return {
        x: shape.x - (spacingValue > 0 ? spacingAmount : 0),
        y: shape.y - (spacingValue > 0 ? spacingAmount : 0),
        width: shape.width + (spacingValue > 0 ? 2 * spacingAmount : 0),
        height: shape.height + (spacingValue > 0 ? 2 * spacingAmount : 0)
    };
}

// Проверка перекрытия двух прямоугольников
function checkOverlap(rect1, rect2, spacingValue) {
    // При отрицательном spacing, разрешаем частичное перекрытие
    // Чем ближе spacing к -100, тем больше разрешенное перекрытие
    
    // Стандартная проверка перекрытия прямоугольников
    if (spacingValue >= 0) {
        // Для положительного spacing проверяем любое перекрытие
        return !(
            rect1.x + rect1.width < rect2.x ||
            rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y ||
            rect1.y > rect2.y + rect2.height
        );
    } else {
        // Для отрицательного spacing определяем допустимую степень перекрытия
        // Чем ближе к -100, тем больше разрешенное перекрытие
        const overlapThreshold = Math.min(rect1.width, rect2.width) * (-spacingValue/100);
        
        // Вычисляем реальное перекрытие
        const overlapX = Math.max(0, 
            Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - 
            Math.max(rect1.x, rect2.x)
        );
        
        const overlapY = Math.max(0, 
            Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - 
            Math.max(rect1.y, rect2.y)
        );
        
        // Перекрытие существует, если есть пересечение по обеим осям
        const isOverlap = overlapX > 0 && overlapY > 0;
        
        // Если перекрытие меньше порога, считаем позицию валидной
        return isOverlap && (overlapX > overlapThreshold || overlapY > overlapThreshold);
    }
}

// Получение границ фигуры
function getShapeBounds(shape, spacingValue) {
    // Извлекаем атрибуты положения и размера
    const x = parseFloat(shape.getAttribute('x'));
    const y = parseFloat(shape.getAttribute('y'));
    const width = parseFloat(shape.getAttribute('width'));
    const height = parseFloat(shape.getAttribute('height'));
    
    // Возвращаем объект с границами
    return {
        x: x,
        y: y,
        width: width,
        height: height,
        spacing: spacingValue
    };
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
