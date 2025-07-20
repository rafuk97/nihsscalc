import React, { useState, useEffect, useRef } from 'react';

// Define los ítems del NIHSS con sus opciones, puntajes e instrucciones detalladas
const nihssItems = [
  {
    id: '1A',
    name: 'Nivel de conciencia',
    description: 'Evaluar el nivel de alerta del paciente.',
    options: [
      { optionValue: '1A_0', scoreValue: 0, label: '0: Alerta', isPrimary: true },
      { optionValue: '1A_1', scoreValue: 1, label: '1: Somnoliento: sólo responde a estímulo menor', isPrimary: true },
      { optionValue: '1A_2', scoreValue: 2, label: '2: Estupor: Requiere estímulo repetido, intenso o doloroso', isPrimary: true },
      { optionValue: '1A_3', scoreValue: 3, label: '3: Coma: Respuesta refleja o flácido', isPrimary: true },
    ],
  },
  {
    id: '1B',
    name: 'Orientación',
    description: 'Preguntar “¿En qué mes estamos?” “¿Cuántos años tiene?”. Si hay barreras físicas (IOT, trauma orotraqueal, barrera del lenguaje)/afasia de Broca/anartria: Intentar escribir la respuesta.',
    options: [
      { optionValue: '1B_0_ambas', scoreValue: 0, label: '0: Ambas correctas', isPrimary: true },
      { optionValue: '1B_1_una', scoreValue: 1, label: '1: Una correcta', isPrimary: true },
      { optionValue: '1B_1_barrera', scoreValue: 1, label: '1: Barrera física/afasia de Broca/anartria pero no puede escribir la respuesta' },
      { optionValue: '1B_1_afasia_wernicke', scoreValue: 1, label: '1: Afasia de Wernicke' },
      { optionValue: '1B_1_estupor', scoreValue: 1, label: '1: Estupor' },
      { optionValue: '1B_1_coma', scoreValue: 1, label: '1: Coma' },
      { optionValue: '1B_2_ninguna', scoreValue: 2, label: '2: Ninguna correcta', isPrimary: true },
    ],
  },
  {
    id: '1C',
    name: 'Respuesta motora',
    description: 'Pedir “Haga un puño con la mano y ábralo” “Abra y cierre los ojos” (estímulo auditivo y visual). Sólo se puede repetir 1 vez la orden. Puntuar incluso si sólo hace el intento.',
    options: [
      { optionValue: '1C_0_ambas', scoreValue: 0, label: '0: Realiza ambas', isPrimary: true },
      { optionValue: '1C_1_una', scoreValue: 1, label: '1: Realiza una', isPrimary: true },
      { optionValue: '1C_1_estupor', scoreValue: 1, label: '1: Estupor' },
      { optionValue: '1C_1_coma', scoreValue: 1, label: '1: Coma' },
      { optionValue: '1C_2_ninguna', scoreValue: 2, label: '2: No realiza ninguna', isPrimary: true },
    ],
  },
  {
    id: '2',
    name: 'Mirada conjugada',
    description: 'Evaluar movimientos horizontales, seguir dedo o cara, sostener la cabeza. Afasia de Wernicke/ciego/coma: evaluar reflejos oculocefálicos.',
    options: [
      { optionValue: '2_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '2_0_estrabismo', scoreValue: 0, label: '0: Estrabismo que cruza la línea media' },
      { optionValue: '2_1_parcial', scoreValue: 1, label: '1: Parálisis parcial de 1 o 2 ojos: desviación que puede ser corregida voluntariamente o refleja', isPrimary: true },
      { optionValue: '2_1_paresia', scoreValue: 1, label: '1: Paresia aislada de un nervio craneal' },
      { optionValue: '2_2_total', scoreValue: 2, label: '2: Parálisis total: desviación forzada (tónica)', isPrimary: true },
    ],
  },
  {
    id: '3',
    name: 'Campos visuales',
    description: 'Evaluar cuadrantes por confrontación con dedos (1, 2 o 5 dedos), cada ojo independiente. No puede hablar (afasia de Broca/anartria/IOT): que haga seña con sus dedos. Afasia de Wernicke/estupor/coma: hacer amenaza visual. Evaluar enseguida la extinción visual (ítem 11).',
    options: [
      { optionValue: '3_0_normal', scoreValue: 0, label: '0: Normal en todos los cuadrantes', isPrimary: true },
      { optionValue: '3_0_ceguera_unilateral', scoreValue: 0, label: '0: Ceguera unilateral' },
      { optionValue: '3_1_cuadrantopsia', scoreValue: 1, label: '1: Cuadrantopsia en uno o ambos ojos', isPrimary: true },
      { optionValue: '3_1_extincion', scoreValue: 1, label: '1: Extinción visual' },
      { optionValue: '3_2_hemianopsia', scoreValue: 2, label: '2: Hemianopsia', isPrimary: true },
      { optionValue: '3_3_ceguera_cortical', scoreValue: 3, label: '3: Ceguera cortical o no cortical', isPrimary: true },
    ],
  },
  {
    id: '4',
    name: 'Parálisis facial',
    description: 'Orden verbal y/o mímica, “muestre los dientes o sonría”, “levante las cejas”, “cierre los ojos”. Afasia de Wernicke/estupor: hacer estímulo doloroso.',
    options: [
      { optionValue: '4_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '4_1_paresia_leve', scoreValue: 1, label: '1: Paresia facial: borramiento del surco nasolabial, asimetría leve', isPrimary: true },
      { optionValue: '4_2_parcial', scoreValue: 2, label: '2: Parálisis facial parcial: asimetría marcada en cara inferior', isPrimary: true },
      { optionValue: '4_3_completa', scoreValue: 3, label: '3: Parálisis facial completa: cara superior e inferior (ACV de tallo)', isPrimary: true },
      { optionValue: '4_3_coma', scoreValue: 3, label: '3: Coma' },
    ],
  },
  {
    id: '5A',
    name: 'Motor Miembro superior (lado no parético o izquierdo)',
    description: 'Sentado: 90° // Supino: 45°. Palma en pronación. Contar en voz alta y con los dedos por 10 segundos. Afasia de Wernicke: hacer pantomima.',
    options: [
      { optionValue: '5A_0_sin_claudicacion', scoreValue: 0, label: '0: Sin claudicación', isPrimary: true },
      { optionValue: '5A_1_claudica_no_golpea', scoreValue: 1, label: '1: Claudica pero no golpea la cama', isPrimary: true },
      { optionValue: '5A_2_esfuerzo_golpea', scoreValue: 2, label: '2: Algún esfuerzo, pero golpea la cama', isPrimary: true },
      { optionValue: '5A_3_sin_esfuerzo_contraccion', scoreValue: 3, label: '3: Sin esfuerzo contra la gravedad, hay contracción (mueve el hombro)', isPrimary: true },
      { optionValue: '5A_4_no_contraccion', scoreValue: 4, label: '4: No hay contracción muscular', isPrimary: true },
      { optionValue: '5A_4_coma', scoreValue: 4, label: '4: Coma' },
      { optionValue: '5A_NA', scoreValue: 'NA', label: 'NA: Anquilosis, amputación, fractura', isPrimary: true },
    ],
  },
  {
    id: '5B',
    name: 'Motor Miembro superior (lado parético o derecho)',
    description: 'Sentado: 90° // Supino: 45°. Palma en pronación. Contar en voz alta y con los dedos por 10 segundos. Afasia de Wernicke: hacer pantomima.',
    options: [
      { optionValue: '5B_0_sin_claudicacion', scoreValue: 0, label: '0: Sin claudicación', isPrimary: true },
      { optionValue: '5B_1_claudica_no_golpea', scoreValue: 1, label: '1: Claudica pero no golpea la cama', isPrimary: true },
      { optionValue: '5B_2_esfuerzo_golpea', scoreValue: 2, label: '2: Algún esfuerzo, pero golpea la cama', isPrimary: true },
      { optionValue: '5B_3_sin_esfuerzo_contraccion', scoreValue: 3, label: '3: Sin esfuerzo contra la gravedad, hay contracción (mueve el hombro)', isPrimary: true },
      { optionValue: '5B_4_no_contraccion', scoreValue: 4, label: '4: No hay contracción muscular', isPrimary: true },
      { optionValue: '5B_4_coma', scoreValue: 4, label: '4: Coma' },
      { optionValue: '5B_NA', scoreValue: 'NA', label: 'NA: Anquilosis, amputación, fractura', isPrimary: true },
    ],
  },
  {
    id: '6A',
    name: 'Motor Miembro inferior (lado no parético o izquierdo)',
    description: 'Supino: 30°. Contar en voz alta y con los dedos por 5 segundos. Afasia de Wernicke: hacer pantomima.',
    options: [
      { optionValue: '6A_0_sin_claudicacion', scoreValue: 0, label: '0: Sin claudicación', isPrimary: true },
      { optionValue: '6A_1_claudica_no_golpea', scoreValue: 1, label: '1: Claudica pero no golpea la cama', isPrimary: true },
      { optionValue: '6A_2_esfuerzo_golpea', scoreValue: 2, label: '2: Algún esfuerzo, pero golpea la cama', isPrimary: true },
      { optionValue: '6A_3_sin_esfuerzo_contraccion', scoreValue: 3, label: '3: Sin esfuerzo contra la gravedad, hay contracción (mueve la cadera)', isPrimary: true },
      { optionValue: '6A_4_no_contraccion', scoreValue: 4, label: '4: No hay contracción muscular', isPrimary: true },
      { optionValue: '6A_4_coma', scoreValue: 4, label: '4: Coma' },
      { optionValue: '6A_NA', scoreValue: 'NA', label: 'NA: Anquilosis, amputación, fractura', isPrimary: true },
    ],
  },
  {
    id: '6B',
    name: 'Motor Miembro inferior (lado parético o derecho)',
    description: 'Supino: 30°. Contar en voz alta y con los dedos por 5 segundos. Afasia de Wernicke: hacer pantomima.',
    options: [
      { optionValue: '6B_0_sin_claudicacion', scoreValue: 0, label: '0: Sin claudicación', isPrimary: true },
      { optionValue: '6B_1_claudica_no_golpea', scoreValue: 1, label: '1: Claudica pero no golpea la cama', isPrimary: true },
      { optionValue: '6B_2_esfuerzo_golpea', scoreValue: 2, label: '2: Algún esfuerzo, pero golpea la cama', isPrimary: true },
      { optionValue: '6B_3_sin_esfuerzo_contraccion', scoreValue: 3, label: '3: Sin esfuerzo contra la gravedad, hay contracción (mueve la cadera)', isPrimary: true },
      { optionValue: '6B_4_no_contraccion', scoreValue: 4, label: '4: No hay contracción muscular', isPrimary: true },
      { optionValue: '6B_4_coma', scoreValue: 4, label: '4: Coma' },
      { optionValue: '6B_NA', scoreValue: 'NA', label: 'NA: Anquilosis, amputación, fractura', isPrimary: true },
    ],
  },
  {
    id: '7',
    name: 'Ataxia',
    description: 'Prueba nariz-dedo y talón-rodilla. Ciego: que extienda el brazo y que se toque la nariz.',
    options: [
      { optionValue: '7_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '7_0_no_entiende', scoreValue: 0, label: '0: No entiende (Afasia de Wernicke, estupor, coma)' },
      { optionValue: '7_0_extremidad_paralizada', scoreValue: 0, label: '0: Extremidad paralizada' },
      { optionValue: '7_1_dismetría_1', scoreValue: 1, label: '1: Dismetría/ataxia de 1 extremidad', isPrimary: true },
      { optionValue: '7_2_dismetría_2', scoreValue: 2, label: '2: Dismetría/ataxia de 2 extremidades', isPrimary: true },
      { optionValue: '7_NA', scoreValue: 'NA', label: 'NA: Anquilosis, amputación, fractura', isPrimary: true },
    ],
  },
  {
    id: '8',
    name: 'Sensibilidad',
    description: 'Evaluar con aguja en: cara, miembros superiores e inferiores. Proximalmente. “¿Siente o no siente?”, “¿Siente alguna diferencia?”',
    options: [
      { optionValue: '8_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '8_0_afasia_estupor_reactivo', scoreValue: 0, label: '0: Afasia/estupor: reactivo al dolor' },
      { optionValue: '8_1_hipoestesia', scoreValue: 1, label: '1: Hipoestesia', isPrimary: true },
      { optionValue: '8_1_afasia_estupor_no_reactivo', scoreValue: 1, label: '1: Afasia/estupor: no reactivo al dolor' },
      { optionValue: '8_2_anestesia', scoreValue: 2, label: '2: Anestesia', isPrimary: true },
      { optionValue: '8_2_coma', scoreValue: 2, label: '2: Coma' },
    ],
  },
  {
    id: '9',
    name: 'Lenguaje',
    description: 'Usar lentes si tiene algún defecto de refracción. Limitación visual: colocar objetos en la mano. IOT: por escrito. Tarea 1: Describir lo que está sucediendo. Tarea 2: Nombrar los objetos. Tarea 3: Leer las frases.',
    options: [
      { optionValue: '9_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '9_1_afasia_incompleta', scoreValue: 1, label: '1: Afasia incompleta (parafasia, pérdida de fluencia o de facilidad de compresión)', isPrimary: true },
      { optionValue: '9_2_afasia_broca_wernicke', scoreValue: 2, label: '2: Afasia de Broca, Wernicke, transcortical, nominal', isPrimary: true },
      { optionValue: '9_3_afasia_global_mutismo', scoreValue: 3, label: '3: Afasia global o mutismo', isPrimary: true },
      { optionValue: '9_3_estupor', scoreValue: 3, label: '3: Estupor que no obedece órdenes' },
      { optionValue: '9_3_coma', scoreValue: 3, label: '3: Coma' },
    ],
    image: 'https://img.notionusercontent.com/s3/prod-files-secure%2Fb60b5aea-9603-4551-b7bd-c6899e30e15e%2F0516c345-ca1a-48e3-8ace-5e0e8f61d358%2Fimage.png/size/w=1420?exp=1753076750&sig=2WvajP0Be1OmqyzSz6T7pK4t9RdBWOc1j5m2iCk5IHw&id=236b12ba-62d9-8024-b054-f498295d0e0c&table=block', // Tarea 1 del ítem 9
    image2: 'https://rafabeta.notion.site/image/attachment%3Af67526fb-98d3-45d7-8ab2-63600b512821%3Aimage.png?table=block&id=236b12ba-62d9-802e-b9af-de86a340200c&spaceId=b60b5aea-9603-4551-b7bd-c6899e30e15e&width=1180&userId=&cache=v2', // Tarea 2 del ítem 9
    image3: 'https://rafabeta.notion.site/image/attachment%3Ab8e5e263-ac7d-4f71-9bfe-db38a296a459%3Aimage.png?table=block&id=236b12ba-62d9-80ed-89c1-fc8d7aee9d42&spaceId=b60b5aea-9603-4551-b7bd-c6899e30e15e&width=1020&userId=&cache=v2', // Tarea 3 del ítem 9
  },
  {
    id: '10',
    name: 'Disartria',
    description: 'Afasia: Evaluar la claridad de la articulación del habla espontánea o pedirle que repita las palabras que yo diga en voz alta.',
    options: [
      { optionValue: '10_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '10_1_leve_moderada', scoreValue: 1, label: '1: Leve-moderada (entendible)', isPrimary: true },
      { optionValue: '10_1_alteracion_odontologica', scoreValue: 1, label: '1: Alteración odontológica' },
      { optionValue: '10_2_severa', scoreValue: 2, label: '2: Severa = Anartria (incomprensible)', isPrimary: true },
      { optionValue: '10_2_coma', scoreValue: 2, label: '2: Coma' },
      { optionValue: '10_NA', scoreValue: 'NA', label: 'NA: IOT/barrera física', isPrimary: true },
    ],
    image: 'https://rafabeta.notion.site/image/attachment%3A3da00c80-da57-463e-ad67-3a2f9fc6e52b%3Aimage.png?table=block&id=236b12ba-62d9-80b0-8d34-cc45caad9a20&spaceId=b60b5aea-9603-4551-b7bd-c6899e30e15e&width=1170&userId=&cache=v2', // Imagen del ítem 10
  },
  {
    id: '11',
    name: 'Extinción e inatención',
    description: 'Estímulo visual y táctil: Un lado → Doble estímulo simultáneo.',
    options: [
      { optionValue: '11_0_normal', scoreValue: 0, label: '0: Normal', isPrimary: true },
      { optionValue: '11_1_inatencion', scoreValue: 1, label: '1: Inatención visual o táctil. Sólo afecta una modalidad', isPrimary: true },
      { optionValue: '11_2_hemi_inatencion', scoreValue: 2, label: '2: Hemi-inatención o extinción de más de una modalidad', isPrimary: true },
      { optionValue: '11_2_coma', scoreValue: 2, label: '2: Coma' },
    ],
  },
];

// Helper function to get score value from optionValue
const getScoreValue = (itemId, optionValue) => {
  const item = nihssItems.find(item => item.id === itemId);
  if (!item) return 0; // Default or error case
  const option = item.options.find(opt => opt.optionValue === optionValue);
  return option ? option.scoreValue : 0;
};

// Componente para el visor de imágenes a pantalla completa
const ImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Cierra al hacer clic fuera de la imagen
    >
      <div className="relative max-w-full max-h-full" onClick={e => e.stopPropagation()}> {/* Evita que el clic en la imagen cierre el modal */}
        <img src={imageUrl} alt="Imagen en pantalla completa" className="max-w-full max-h-full object-contain rounded-xl shadow-xl" /> {/* Rounded corners and shadow for image */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-200 transition duration-200"
          aria-label="Cerrar imagen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};


// Componente principal de la aplicación NIHSS
const App = () => {
  // Estado para almacenar los puntajes seleccionados por el usuario (almacena optionValue)
  const [selectedOptions, setSelectedOptions] = useState({});
  // Estado para el puntaje total acumulado
  const [totalScore, setTotalScore] = useState(0);
  // Estado para el nivel de conciencia del ítem 1A
  const [consciousnessLevel1A, setConsciousnessLevel1A] = useState(null);
  // Estado para mostrar el informe final
  const [showReport, setShowReport] = useState(false);
  // Referencia para el modal de informe
  const reportModalRef = useRef(null);
  // Estado para el índice del ítem actual que se muestra
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  // Estado para la URL de la imagen a mostrar en pantalla completa
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState(null);

  // Derivar estados de coma y estupor para facilitar la lógica y renderizado
  const isComaState = consciousnessLevel1A === 3;
  const isStuporState = consciousnessLevel1A === 2;

  // Lista de ítems que se auto-llenan con "Coma"
  const autoFillComaItems = ['1B', '1C', '4', '5A', '5B', '6A', '6B', '7', '8', '9', '10', '11'];
  // Lista de ítems que se auto-llenan con "Estupor"
  const autoFillStuporItems = ['1B', '1C', '7'];

  // Efecto para calcular el puntaje total cada vez que cambian las opciones seleccionadas
  useEffect(() => {
    let currentTotal = 0;
    for (const itemId in selectedOptions) {
      const score = getScoreValue(itemId, selectedOptions[itemId]);
      if (typeof score === 'number') {
        currentTotal += score;
      }
    }
    setTotalScore(currentTotal);
  }, [selectedOptions]);

  // Manejador de cambio para las selecciones de los ítems
  const handleChange = (itemId, selectedOptionValue, optionLabel, scoreValue) => {
    // Obtener el scoreValue actual de 1A
    const current1AScoreValue = getScoreValue('1A', selectedOptions['1A']);

    // Validación para la opción "Coma" en ítems posteriores
    if (itemId !== '1A' && optionLabel.includes('Coma') && current1AScoreValue !== 3) {
      const actual1ALabel = nihssItems[0].options.find(opt => opt.scoreValue === current1AScoreValue)?.label || 'no seleccionado';
      alert(`Si en el ítem 1A no se seleccionó "Coma" sino "${actual1ALabel}", no se puede seleccionar "Coma" en este ítem. Si realmente el paciente está en coma, por favor, repita el score desde el inicio.`);
      return; // Prevenir la actualización del estado
    }

    // Validación para la opción "Estupor" en ítems posteriores
    if (itemId !== '1A' && optionLabel.includes('Estupor') && current1AScoreValue !== 2 && current1AScoreValue !== 3) {
      const actual1ALabel = nihssItems[0].options.find(opt => opt.scoreValue === current1AScoreValue)?.label || 'no seleccionado';
      alert(`Si en el ítem 1A no se seleccionó "Estupor" o "Coma" sino "${actual1ALabel}", no se puede seleccionar "Estupor" en este ítem. Si realmente el paciente está en estupor, por favor, repita el score desde el inicio.`);
      return; // Prevenir la actualización del estado
    }

    let newSelectedOptions = { ...selectedOptions, [itemId]: selectedOptionValue };

    // Lógica para el escenario de 1A (Coma o Estupor)
    if (scoreValue === 3) { // Coma seleccionado
      const comaOptions = { '1A': selectedOptionValue }; // Start with 1A's selection

      nihssItems.forEach(item => {
        if (autoFillComaItems.includes(item.id)) { // Solo auto-llenar ítems especificados para Coma
          // Special handling for item 7
          if (item.id === '7') {
            comaOptions[item.id] = '7_0_no_entiende'; // Explicitly set for "0: No entiende (Afasia de Wernicke, estupor, coma)"
          } else {
            const comaOption = item.options.find(opt => opt.label.includes('Coma'));
            if (comaOption) {
              comaOptions[item.id] = comaOption.optionValue;
            } else {
              // Fallback for items without a specific 'Coma' option, pick the highest score or NA if available
              const highestScoreOption = item.options.reduce((prev, current) => {
                if (typeof prev.scoreValue === 'number' && typeof current.scoreValue === 'number') {
                  return (prev.scoreValue > current.scoreValue) ? prev : current;
                }
                return prev;
              }, { scoreValue: -Infinity });
              if (highestScoreOption.optionValue) {
                comaOptions[item.id] = highestScoreOption.optionValue;
              } else if (item.options.find(opt => opt.scoreValue === 'NA')) {
                comaOptions[item.id] = item.options.find(opt => opt.scoreValue === 'NA').optionValue;
              }
            }
          }
        }
      });
      setSelectedOptions(comaOptions);
    } else if (scoreValue === 2 && itemId === '1A') { // Estupor seleccionado solo si es en 1A
      const stuporOptions = { ...newSelectedOptions }; // Incluir la selección actual de 1A
      nihssItems.forEach(item => {
        if (autoFillStuporItems.includes(item.id)) { // Solo auto-llenar ítems especificados para Estupor
          // Special handling for item 7
          if (item.id === '7') {
            stuporOptions[item.id] = '7_0_no_entiende'; // Explicitly set for "0: No entiende (Afasia de Wernicke, estupor, coma)"
          } else {
            const stuporOption = item.options.find(opt => opt.label.includes('Estupor'));
            if (stuporOption) {
              stuporOptions[item.id] = stuporOption.optionValue;
            }
          }
        } else if (item.id !== '1A') { // Limpiar otros ítems si no son 1A y no son los auto-llenados por estupor
          delete stuporOptions[item.id];
        }
      });
      setSelectedOptions(stuporOptions);
    } else { // Ni Coma ni Estupor seleccionados en 1A o es otro ítem
      setSelectedOptions(newSelectedOptions);
    }

    if (itemId === '1A') {
      setConsciousnessLevel1A(scoreValue); // Actualizar el nivel de conciencia de 1A
    }
  };

  // Función para avanzar al siguiente ítem
  const handleNext = () => {
    const currentItem = nihssItems[currentItemIndex];
    const currentItemId = currentItem.id;

    // Determine if the current item is auto-filled based on 1A's state
    const isCurrentItemAutoFilledByComa = isComaState && autoFillComaItems.includes(currentItemId);
    const isCurrentItemAutoFilledByStupor = isStuporState && autoFillStuporItems.includes(currentItemId);

    // If the current item is not selected AND it's not an auto-filled item (except 1A itself)
    if (selectedOptions[currentItemId] === undefined && !isCurrentItemAutoFilledByComa && !isCurrentItemAutoFilledByStupor) {
      alert('Por favor, seleccione una opción para el ítem actual antes de continuar.');
      return;
    }

    let nextIndex = currentItemIndex + 1;
    let foundNextManualItem = false;

    // If 1A is in a state that triggers auto-filling for subsequent items
    if (isComaState || isStuporState) {
      while (nextIndex < nihssItems.length) {
        const nextItem = nihssItems[nextIndex];
        const nextItemId = nextItem.id;

        const isNextItemAutoFilledByComa = isComaState && autoFillComaItems.includes(nextItemId);
        const isNextItemAutoFilledByStupor = isStuporState && autoFillStuporItems.includes(nextItemId);

        // If the next item is NOT auto-filled by either coma or stupor, then it's a manual item.
        if (!isNextItemAutoFilledByComa && !isNextItemAutoFilledByStupor) {
          setCurrentItemIndex(nextIndex);
          foundNextManualItem = true;
          break; // Exit the loop once a manual item is found
        }
        nextIndex++;
      }
    }

    // If no specific auto-fill jump happened (either not in coma/stupor, or all subsequent items are auto-filled)
    if (!foundNextManualItem) {
      if (nextIndex < nihssItems.length) {
        setCurrentItemIndex(nextIndex);
      } else {
        // If we've reached the end of the items, stay on the last item
        setCurrentItemIndex(nihssItems.length - 1);
      }
    }
  };

  // Función para generar el informe
  const generateReport = () => {
    // Verificar si todos los ítems obligatorios han sido seleccionados
    const allItemsSelected = nihssItems.every(item => {
      // Si el paciente está en coma, solo 1A es obligatorio para iniciar la secuencia de coma
      if (isComaState) {
        return selectedOptions['1A'] !== undefined;
      }
      // Si el paciente está en estupor, 1A, y los ítems de auto-llenado por estupor son obligatorios
      if (isStuporState) {
        return selectedOptions['1A'] !== undefined && autoFillStuporItems.every(id => selectedOptions[id] !== undefined);
      }
      // Para otros escenarios, todos los ítems deben tener un valor (no nulo o indefinido)
      return selectedOptions[item.id] !== undefined;
    });

    if (!allItemsSelected) {
      alert('Por favor, complete todos los ítems antes de generar el informe, a menos que el paciente esté en coma o estupor.');
      return;
    }
    setShowReport(true);
  };

  // Función para cerrar el modal del informe
  const closeReportModal = () => {
    setShowReport(false);
  };

  // Función para copiar el informe al portapapeles
  const copyReportToClipboard = () => {
    let reportText = '';
    nihssItems.forEach(item => {
      const selectedOptionValue = selectedOptions[item.id];
      if (selectedOptionValue !== undefined) {
        const score = getScoreValue(item.id, selectedOptionValue);
        if (score === 'NA') {
          reportText += `Ítem ${item.id}: No aplicable.\n`;
        } else {
          reportText += `Ítem ${item.id}: ${score} puntos.\n`;
        }
      }
    });
    reportText += `Puntaje Total NIHSS: ${totalScore}`;

    // Usar document.execCommand('copy') para compatibilidad en iframes
    const textArea = document.createElement('textarea');
    textArea.value = reportText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Informe copiado al portapapeles.');
    } catch (err) {
      console.error('Error al copiar el informe: ', err);
      alert('Error al copiar el informe. Por favor, copie manualmente.');
    }
    document.body.removeChild(textArea);
  };

  // Efecto para manejar clics fuera del modal y cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reportModalRef.current && !reportModalRef.current.contains(event.target)) {
        closeReportModal();
      }
    };

    if (showReport) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReport]);

  const currentItem = nihssItems[currentItemIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-6 font-sans">
      {/* Las etiquetas <link> y <script> de Tailwind CSS y la fuente IBM Plex Sans
          han sido movidas a public/index.html para un correcto despliegue. */}

      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-6"> {/* Contenedor principal con flexbox y más espacio */}
        {/* Contenido principal del formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full md:w-2/3 mb-8 md:mb-0 transform transition-all duration-300 hover:scale-[1.005]"> {/* Más redondeado y sombra */}
          <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">Calculadora NIHSS</h1> {/* Título más grande y oscuro */}

          {isComaState && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 shadow-sm"> {/* Estilo más suave */}
              <p className="font-bold text-lg">¡Atención!</p>
              <p className="text-sm">Ha seleccionado "Coma" en el Nivel de Conciencia (1A). Los puntajes para los ítems relacionados se han establecido automáticamente según los criterios de coma.</p>
            </div>
          )}
          {isStuporState && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 shadow-sm"> {/* Estilo más suave */}
              <p className="font-bold text-lg">¡Atención!</p>
              <p className="text-sm">Ha seleccionado "Estupor" en el Nivel de Conciencia (1A). Los puntajes para los ítems 1B, 1C y 7 se han establecido automáticamente según los criterios de estupor.</p>
            </div>
          )}

          {/* Mostrar solo el ítem actual */}
          <div key={currentItem.id} className="mb-8 p-6 border border-blue-100 rounded-xl bg-white shadow-md"> {/* Más redondeado, sombra y borde azul suave */}
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">{currentItem.id}. {currentItem.name}</h2> {/* Título de ítem más grande y azul */}
            {currentItem.description && (
              <p className="text-gray-600 text-base mb-5 italic leading-relaxed">{currentItem.description}</p>
            )}
            {currentItem.image && (
              <div className="mb-6 flex flex-col items-center space-y-4"> {/* Más espacio entre imágenes */}
                <img
                  src={currentItem.image}
                  alt={`Imagen de ${currentItem.name} Tarea 1`}
                  className="max-w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setFullScreenImageUrl(currentItem.image)}
                  onError={(e) => e.target.src = `https://placehold.co/600x400/D1D5DB/4B5563?text=Imagen+No+Disponible`}
                />
                {currentItem.image2 && <img
                  src={currentItem.image2}
                  alt={`Imagen de ${currentItem.name} Tarea 2`}
                  className="max-w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setFullScreenImageUrl(currentItem.image2)}
                  onError={(e) => e.target.src = `https://placehold.co/600x400/D1D5DB/4B5563?text=Imagen+No+Disponible`}
                />}
                {currentItem.image3 && <img
                  src={currentItem.image3}
                  alt={`Imagen de ${currentItem.name} Tarea 3`}
                  className="max-w-full h-auto rounded-lg shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setFullScreenImageUrl(currentItem.image3)}
                  onError={(e) => e.target.src = `https://placehold.co/600x400/D1D5DB/4B5563?text=Imagen+No+Disponible`}
                />}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Más espacio entre opciones */}
              {currentItem.options.map((option, index) => (
                <label key={option.optionValue} className="flex items-center p-4 bg-blue-50 rounded-lg shadow-sm cursor-pointer hover:bg-blue-100 transition duration-200 ease-in-out border border-blue-200"> {/* Fondo azul claro, borde */}
                  <input
                    type="radio"
                    name={`item-${currentItem.id}`}
                    value={option.optionValue} // Usar optionValue único
                    checked={selectedOptions[currentItem.id] === option.optionValue}
                    onChange={() => handleChange(currentItem.id, option.optionValue, option.label, option.scoreValue)}
                    className="form-radio h-5 w-5 text-blue-600 rounded-full focus:ring-blue-500 border-gray-300"
                    // Deshabilitar solo si está en coma/estupor (auto-llenado) o si es un ítem anterior
                    disabled={
                      (isComaState && autoFillComaItems.includes(currentItem.id) && currentItem.id !== '1A') || // Deshabilitar por auto-llenado de coma
                      (isStuporState && autoFillStuporItems.includes(currentItem.id) && currentItem.id !== '1A') || // Deshabilitar por auto-llenado de estupor
                      nihssItems.indexOf(currentItem) < currentItemIndex // Deshabilitar ítems anteriores
                    }
                  />
                  <span className={`ml-3 text-gray-800 text-base ${option.isPrimary ? 'font-semibold' : ''}`}> {/* Texto más grande y oscuro */}
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {selectedOptions[currentItem.id] !== undefined && (
              <p className="mt-4 text-right text-lg font-bold text-blue-700"> {/* Puntaje más grande y en negrita */}
                Puntaje para {currentItem.id}: {getScoreValue(currentItem.id, selectedOptions[currentItem.id]) === 'NA' ? 'NA' : getScoreValue(currentItem.id, selectedOptions[currentItem.id])}
              </p>
            )}
          </div>

          <div className="mt-8 flex justify-center"> {/* Centrar el botón */}
            {currentItemIndex < nihssItems.length - 1 && (
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 w-full text-lg focus:outline-none focus:ring-4 focus:ring-blue-300" // Más grande, más padding, foco
              >
                Siguiente Ítem
              </button>
            )}

            {currentItemIndex === nihssItems.length - 1 && (
              <button
                onClick={generateReport}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 w-full text-lg focus:outline-none focus:ring-4 focus:ring-green-300" // Más grande, más padding, foco
              >
                Generar Informe Final
              </button>
            )}
          </div>
        </div>

        {/* Sidebar para el puntaje en tiempo real */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full md:w-1/3"> {/* Más redondeado y sombra */}
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Puntajes NIHSS</h2> {/* Título más grande y oscuro */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2"> {/* Altura ajustada y scroll */}
            {nihssItems.map(item => {
              const selectedOptionValue = selectedOptions[item.id];
              const score = selectedOptionValue !== undefined ? getScoreValue(item.id, selectedOptionValue) : undefined;
              return (
                <p key={item.id} className="text-gray-700 text-base mb-2"> {/* Texto más grande */}
                  <span className="font-semibold text-blue-600">Ítem {item.id}:</span> {score === undefined ? 'No seleccionado' : (score === 'NA' ? 'No aplicable' : `${score} puntos`)}
                </p>
              );
            })}
          </div>
          <div className="mt-8 p-6 bg-blue-700 text-white rounded-xl shadow-md text-center"> {/* Fondo azul más oscuro y redondeado */}
            <h2 className="text-3xl font-bold">Puntaje Total: {totalScore}</h2> {/* Puntaje más grande */}
          </div>
        </div>
      </div>


      {showReport && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div ref={reportModalRef} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100"> {/* Más redondeado y sombra */}
            <h3 className="text-3xl font-bold text-blue-700 mb-5 text-center">Informe Resumido NIHSS</h3> {/* Título más grande */}
            <div className="max-h-80 overflow-y-auto mb-6 p-4 border border-blue-100 rounded-lg bg-gray-50"> {/* Borde y fondo suave */}
              {nihssItems.map(item => {
                const selectedOptionValue = selectedOptions[item.id];
                const score = selectedOptionValue !== undefined ? getScoreValue(item.id, selectedOptionValue) : undefined;
                return (
                  <p key={item.id} className="text-gray-800 text-base mb-1">
                    <span className="font-semibold text-blue-600">Ítem {item.id}:</span> {score === 'NA' ? 'No aplicable.' : `${score} puntos.`}
                  </p>
                );
              })}
              <p className="text-xl font-bold text-blue-700 mt-4 pt-4 border-t border-blue-200">Puntaje Total NIHSS: {totalScore}</p> {/* Separador y texto más grande */}
            </div>
            <div className="flex justify-end space-x-4"> {/* Más espacio entre botones */}
              <button
                onClick={copyReportToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Copiar Informe
              </button>
              <button
                onClick={closeReportModal}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visor de imágenes a pantalla completa */}
      <ImageViewer imageUrl={fullScreenImageUrl} onClose={() => setFullScreenImageUrl(null)} />
    </div>
  );
};

export default App;
