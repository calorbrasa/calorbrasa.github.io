"""
Guías de compra «mejor…» de CalorBrasa (solo datos; las genera tools/build_static.py).

Cada guía elige modelos del catálogo (data/products.json) por su id. Los textos de
cada modelo («por qué», pros y contras) están escritos a partir de sus datos: si un
modelo deja de estar en el catálogo, la guía lo omite y avisa al generar.
"""

UPDATED = "octubre de 2026"
UPDATED_ISO = "2026-10-19"

METODO = (
    "No hemos probado estas estufas en casa. Las elegimos comparando sus datos técnicos (potencia, "
    "metros que calientan, ruido, autonomía), nuestra Nota CalorBrasa, que puntúa seis criterios de 0 a 10, "
    "y las opiniones de los compradores en Amazon, dando más peso a los modelos con muchas opiniones. "
    "El gasto lo calculamos igual en todas las fichas: 8 horas al día a potencia media con precios de septiembre de 2026."
)

GUIAS = [
    {
        "slug": "mejor-estufa-pellets-calidad-precio",
        "cat": "pellets",
        "title": "Mejor estufa de pellets calidad-precio 2026: 6 modelos recomendados",
        "desc": "Las estufas de pellets con mejor relación calidad-precio de 2026: la mejor para un piso, para una casa grande, con WiFi, canalizable y sin electricidad. Con su gasto diario y opiniones.",
        "h1": "Mejor estufa de pellets calidad-precio 2026",
        "lead": "Hemos comparado las 37 estufas de pellets de CalorBrasa para quedarnos con las que mejor equilibran lo que cuestan, lo que calientan y lo que opinan quienes ya las usan.",
        "summary": "Para un piso o una casa de tamaño medio, la mejor calidad-precio es la <b>STUFE California de 8 kW</b>: calienta hasta unos 70 m², es de las más valoradas y sus versiones en negro y en rojo suman 88 opiniones. Para casas grandes, la <b>Siberia Aria New de 15 kW</b>.",
        "picks": [
            {"id": "pellets-stufe-california-blanco", "label": "Mejor calidad-precio",
             "why": "Es la estufa de pellets más equilibrada del catálogo para una vivienda de tamaño medio: 8,2 kW, hasta unos 70 m², depósito de 15 kg y una de las mejores valoraciones con muchas opiniones (también se vende en negro y en rojo).",
             "pros": ["Muy valorada por quienes la tienen", "Tamaño compacto y 5 niveles de potencia", "Depósito de 15 kg: muchas horas sin recargar"],
             "contras": ["Necesita salida de humos", "Pesa unos 80 kg"]},
            {"id": "pellets-stufe-siberia15-negro", "label": "Para casas grandes",
             "why": "La más potente del catálogo (15 kW, hasta unos 140 m²) y de las mejor valoradas. Con su depósito de 23 kg aguanta muchas horas sin recargar.",
             "pros": ["Máxima potencia del catálogo", "Depósito grande de 23 kg", "Valoración muy alta"],
             "contras": ["Pesa unos 115 kg", "Demasiado grande para un piso pequeño"]},
            {"id": "pellets-stufe-colorado15-blanco", "label": "Mejor Nota CalorBrasa",
             "why": "La de mejor nota de nuestro análisis: 14,5 kW, hasta unos 140 m² y depósito de 23 kg. Una alternativa a la Siberia para casas grandes, en blanco.",
             "pros": ["Mejor Nota CalorBrasa de las de pellets", "Gran autonomía", "Buena valoración de los compradores"],
             "contras": ["Pesa unos 115 kg", "Necesita salida de humos"]},
            {"id": "pellets-stufe-california8wifi-blanco", "label": "Con WiFi",
             "why": "La misma idea que la California de 8 kW, pero con control desde el móvil: puedes encenderla antes de llegar a casa y programarla sin estar delante.",
             "pros": ["Control y programación desde el móvil", "Tamaño compacto para pisos"],
             "contras": ["Cuesta más que la versión sin WiFi", "Pocas opiniones todavía"]},
            {"id": "pellets-stufe-marmolada14canalizado-blanco", "label": "Canalizable",
             "why": "Lleva parte del calor por conductos a otra habitación, así que con una sola estufa calientas dos estancias. Tiene 14 kW y un fondo reducido.",
             "pros": ["Calienta una segunda habitación", "Fondo reducido, ocupa poco"],
             "contras": ["La canalización necesita instalación profesional", "Pesa unos 110 kg"]},
            {"id": "pellets-joima-naturstyle-negro", "label": "Sin electricidad",
             "why": "Funciona por gravedad, sin enchufe: sirve en casas sin toma de corriente cerca o donde hay cortes de luz. Tiene muy buena valoración.",
             "pros": ["No necesita luz", "Mantenimiento sencillo", "Muy bien valorada"],
             "contras": ["Rinde menos que las eléctricas (75 %)", "No se puede programar"]},
        ],
        "evitar": [],
        "consejos": [
            "<b>Potencia</b>: calcula los kW que necesitas con la <a href=\"https://calculadora-calefaccion.github.io/calculadora-potencia-estufa.html\" target=\"_blank\" rel=\"noopener\">calculadora de potencia</a>. Una estufa demasiado grande trabaja al mínimo, se ensucia y quema peor.",
            "<b>Salida de humos</b>: todas la necesitan. En un piso, la comunidad tiene que permitirla.",
            "<b>Depósito</b>: cuanto más grande, menos veces lo rellenas. Con 15 kg (un saco) aguanta un día de uso normal.",
            "<b>WiFi y programación</b>: muy cómodo para encenderla antes de llegar a casa.",
            "<b>Canalizable</b>: si quieres calentar más de una habitación con la misma estufa.",
        ],
        "faq_extra": [
            ("¿Qué potencia de estufa de pellets necesito?",
             "Como referencia, 1 kW por cada 10 m² en una casa con aislamiento normal; algo más en zonas frías o con techos altos. Una de 8 kW va bien para unos 70–80 m²."),
            ("¿Merece la pena una estufa de pellets con WiFi?",
             "Si quieres encenderla antes de llegar a casa o programarla sin estar delante, sí. Calentar, calienta igual que la versión sin WiFi."),
            ("¿Qué es una estufa de pellets canalizable?",
             "Una estufa que, además de calentar la habitación donde está, manda parte del aire caliente por conductos a otras habitaciones. Necesita instalación profesional."),
            ("¿Hay estufas de pellets que funcionen sin luz?",
             "Sí, algunas funcionan por gravedad, como la JOIMA Natur Style. A cambio rinden algo menos y no se pueden programar."),
        ],
    },
    {
        "slug": "mejor-estufa-electrica-bajo-consumo",
        "cat": "electricos",
        "title": "Mejor estufa eléctrica de bajo consumo 2026: las que menos gastan",
        "desc": "Las mejores estufas eléctricas de bajo consumo de 2026 para salón, dormitorio y baño, y la verdad sobre el «bajo consumo». Con lo que gasta cada una por hora y al día.",
        "h1": "Mejor estufa eléctrica de bajo consumo 2026",
        "lead": "Hemos comparado las 37 estufas y calefactores eléctricos de CalorBrasa para elegir los que mejor aprovechan cada kWh: con termostato, la potencia justa y muchas opiniones buenas.",
        "summary": "Primero, la verdad: <b>todas las estufas eléctricas convierten el 100 % de la luz en calor</b>, así que una de 1.500 W gasta lo mismo que otra de 1.500 W. Gasta menos la que tiene la potencia justa y un buen termostato. Para la mayoría de habitaciones, nuestra elección es el <b>Dreo cerámico de 1.500 W</b>: más de 10.000 opiniones y muy silencioso.",
        "picks": [
            {"id": "electricos-dreo-1500w", "label": "Mejor en general",
             "why": "Calefactor cerámico de 1.500 W, muy silencioso (34 dB) y el más probado del catálogo, con más de 10.000 opiniones. Con 1.500 W gasta menos por hora que los de 2.000 W y basta para un dormitorio o un salón pequeño.",
             "pros": ["Más de 10.000 opiniones con muy buena nota", "Silencioso para dormir o trabajar", "Bloqueo infantil"],
             "contras": ["Para estancias de más de 20 m² se queda corto"]},
            {"id": "electricos-briebe-convector", "label": "Para el dormitorio",
             "why": "Convector de 2.000 W con termostato que se apaga solo al llegar a la temperatura, y de los más silenciosos (25 dB) porque no tiene ventilador. Reparte el calor por toda la habitación.",
             "pros": ["Silencioso: sin ventilador", "Termostato automático", "Muy ligero, con asas"],
             "contras": ["Tarda más en calentar que un cerámico"]},
            {"id": "electricos-rowenta-intensecomfortaqua", "label": "Para el baño",
             "why": "Calefactor pensado para el baño, muy silencioso (29 dB) y de marca de referencia, con casi 8.800 opiniones. Calienta el baño en pocos minutos, que es como menos se gasta: encender, calentar y apagar.",
             "pros": ["Diseñado para el baño", "Muy silencioso", "Miles de opiniones buenas"],
             "contras": ["Protección IP21: no puede mojarse", "2.400 W: gasta bastante si se deja encendido mucho rato"]},
            {"id": "electricos-orbegozo-bp5003", "label": "Para ratos cortos",
             "why": "Estufa de cuarzo de 1.200 W: calienta al momento a quien tiene delante, así que es la más barata para ratos cortos (sentarte a leer, vestirte por la mañana). Muy barata y con más de 1.000 opiniones.",
             "pros": ["Calor instantáneo", "Gasta poco por hora (1.200 W)", "Muy económica"],
             "contras": ["No calienta toda la habitación", "Solo para espacios pequeños"]},
            {"id": "electricos-kaminio-marlonpro50", "label": "Chimenea eléctrica",
             "why": "Si quieres el efecto de una chimenea, es la mejor valorada del catálogo (4,8 sobre 5 con más de 850 opiniones). Se puede empotrar, colgar o dejar de pie, y tiene 12 colores de LED y 5 niveles de llama.",
             "pros": ["La mejor valorada de las chimeneas", "Se empotra, se cuelga o va de pie", "12 colores y 5 niveles de llama"],
             "contras": ["Más cara que un calefactor normal", "Calienta como cualquier aparato de 1.800 W"]},
            {"id": "electricos-amazonbasics-ceramico", "label": "Más económica",
             "why": "Calefactor cerámico de 1.800 W muy barato, con certificación de seguridad TÜV y buena nota de los compradores. Una buena opción para tener de apoyo.",
             "pros": ["Precio muy bajo", "Certificación de seguridad TÜV", "Buena relación calidad-precio"],
             "contras": ["No apto para baños", "Más ruidoso que el Dreo"]},
        ],
        "evitar": [
            ("electricos-orbegozo-bp5000", "Estufa de cuarzo de 800 W con una de las peores notas de los compradores de su tipo (3,6 sobre 5). Por un precio parecido tienes la Orbegozo BP 5003, mucho mejor valorada."),
            ("electricos-ardes-halo12", "Estufa halógena con una valoración baja (3,8 sobre 5) para las opiniones que tiene. Hay opciones mejor valoradas al mismo precio."),
        ],
        "consejos": [
            "<b>Termostato</b>: es lo que de verdad ahorra, porque apaga la estufa cuando llega a la temperatura.",
            "<b>Potencia justa</b>: 1.500 W para un dormitorio, 2.000 W para un salón de unos 20 m². Más potencia solo gasta más.",
            "<b>Tipo</b>: cerámicos para calentar rápido, convectores o radiadores de aceite para muchas horas, cuarzo para ratos cortos.",
            "<b>Baño</b>: usa solo aparatos pensados para el baño, con la protección de agua (IP) que indique el fabricante.",
            "<b>Horas baratas</b>: con la tarifa regulada, la luz cuesta menos de 0 a 8 h y los fines de semana.",
        ],
        "faq_extra": [
            ("¿Cuál es la estufa eléctrica que menos consume?",
             "A igual potencia, todas consumen lo mismo por hora. Gasta menos la de menor potencia que caliente bien tu habitación y la que tiene termostato, porque se apaga sola al llegar a la temperatura."),
            ("¿Qué es mejor, un calefactor cerámico, un convector o una estufa de cuarzo?",
             "El cerámico calienta rápido una habitación pequeña; el convector reparte el calor de forma más uniforme y es más silencioso; el de cuarzo calienta solo lo que tiene delante y va bien para ratos cortos."),
            ("¿Las chimeneas eléctricas gastan mucho?",
             "Lo mismo que cualquier calefactor de su potencia cuando dan calor. El efecto llama solo, con el calor apagado, consume muy poco."),
        ],
    },
    {
        "slug": "mejor-estufa-butano",
        "cat": "gas",
        "title": "Mejor estufa de butano 2026: llama azul, catalítica o infrarrojos",
        "desc": "Las mejores estufas de butano de 2026: llama azul, catalítica, infrarrojos y plegable. Cuál elegir según la habitación, lo que gastan y las que no recomendamos.",
        "h1": "Mejor estufa de butano 2026",
        "lead": "Hemos comparado las estufas de butano de CalorBrasa para elegir la mejor de cada tipo: llama azul, catalítica, infrarrojos y plegable.",
        "summary": "La mejor estufa de butano para la mayoría de casas es la <b>Orbegozo HBF 90 de llama azul</b>: más de 8.400 opiniones y buena nota. Casi todas tienen 4.200 W, así que <b>gastan lo mismo</b> a igual uso; lo que cambia es cómo dan el calor.",
        "picks": [
            {"id": "gas-orbegozo-hbf-90", "label": "Mejor en general",
             "why": "Estufa de llama azul de 4.200 W, la que más opiniones tiene del catálogo (más de 8.400) y con buena nota. La llama azul calienta el aire de toda la habitación, así que va bien para un salón.",
             "pros": ["Miles de opiniones buenas", "Calienta toda la habitación", "Sirve para butano y propano"],
             "contras": ["Suelta humedad, como todas las de butano", "Hay que ventilar a menudo"]},
            {"id": "gas-sogo-catalitica-4200w", "label": "Catalítica",
             "why": "Las catalíticas queman el gas sin llama, en una placa: son muy silenciosas y dan un calor suave. Esta se pliega y ocupa muy poco al guardarla en verano.",
             "pros": ["Sin llama abierta", "Muy silenciosa", "Plegable: ocupa poco guardada"],
             "contras": ["Calor más suave que el de una de llama azul", "Hay que ventilar igual"]},
            {"id": "gas-orbegozo-hce-73", "label": "Infrarrojos",
             "why": "Panel cerámico de infrarrojos: el calor se nota al momento en quien está delante, aunque la habitación tarde más en caldearse. Muy buena nota de calidad-precio y más de 2.100 opiniones.",
             "pros": ["Calor inmediato", "Tres niveles de calor", "Buena calidad-precio"],
             "contras": ["Calienta menos uniforme que la de llama azul", "Algún usuario cita encendido irregular"]},
            {"id": "gas-cecotec-readywarm4500-negro", "label": "Plegable y ligera",
             "why": "Llama azul en una estufa plegable de menos de 7 kg: la más fácil de mover y de guardar. Una buena opción para una segunda residencia.",
             "pros": ["Muy ligera y plegable", "Precio muy ajustado"],
             "contras": ["Solo 2 niveles de potencia", "Menos opiniones que la Orbegozo HBF 90"]},
        ],
        "evitar": [
            ("gas-cecotec-readywarm4200-negro", "Su valoración es la más baja de las estufas de butano del catálogo (2,9 sobre 5, con cientos de opiniones). Por un precio parecido, la ReadyWarm 4500 o la Orbegozo HBF 90 están mucho mejor valoradas."),
        ],
        "consejos": [
            "<b>Llama azul</b>: calienta el aire de la habitación. La mejor opción para un salón.",
            "<b>Infrarrojos</b>: calor directo e inmediato a quien está delante.",
            "<b>Catalítica</b>: sin llama y muy silenciosa, con un calor más suave.",
            "<b>Seguridad</b>: que tenga analizador de atmósfera y válvula de seguridad. Nunca en dormitorios ni baños. Lee <a href=\"https://calculadora-calefaccion.github.io/es-peligrosa-estufa-butano.html\" target=\"_blank\" rel=\"noopener\">cómo usarla sin peligro</a>.",
            "<b>Metros</b>: una de 4.200 W calienta unos 30–40 m². Para más superficie, mejor otra calefacción.",
        ],
        "faq_extra": [
            ("¿Qué es mejor, una estufa de butano de llama azul, catalítica o de infrarrojos?",
             "La de llama azul calienta mejor toda la habitación; la de infrarrojos da calor inmediato a quien tiene delante; la catalítica es la más silenciosa y suave. Gastan lo mismo a igual potencia."),
            ("¿Qué estufa de butano gasta menos?",
             "A la misma potencia, todas gastan lo mismo: casi todo el gas se convierte en calor. Gasta menos la que usas a potencia media en vez de a tope."),
            ("¿Es segura una estufa de butano?",
             "Sí, si tiene analizador de atmósfera y la usas ventilando, nunca en dormitorios ni baños y nunca para dormir."),
        ],
    },
]
