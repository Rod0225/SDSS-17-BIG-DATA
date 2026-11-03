# Documentación Científica y Técnica de las Variables: SDSS-17

El conjunto de datos **Stellar Classification Dataset - SDSS17** proviene de la 17ª entrega de datos (Data Release 17 - DR17) del **Sloan Digital Sky Survey (SDSS)**.
Contiene **100,000 observaciones** astronómicas y **18 columnas**, clasificando objetos en tres clases astrofísicas: **GALAXY** (Galaxia), **STAR** (Estrella) y **QSO** (Quásar / Objeto Cuasi-Estelar).

---

## 1. Distribución de la Variable Objetivo (`class`)

| Categoría | Significado Astrofísico | Cantidad | Porcentaje (%) | Rol en ML |
| :--- | :--- | :--- | :--- | :--- |
| **GALAXY** | Sistema masivo ligado gravitacionalmente compuesto por estrellas, gas y polvo. | 59,445 | 59.45% | Clase objetivo |
| **STAR** | Objeto astronómico estelar dentro de la Vía Láctea que genera energía nuclear. | 21,594 | 21.59% | Clase objetivo |
| **QSO** | Cuásar (núcleo galáctico activo ultra-luminoso alimentado por agujero negro supermasivo). | 18,961 | 18.96% | Clase objetivo |

---

## 2. Diccionario Detallado de Variables

### 1. `obj_ID`
- **Descripción Científica**: Identificador único fotométrico asignado por el SDSS a cada detección en las placas CCD.
- **Tipo de Dato**: `float64` (notación entera de 64 bits del SDSS: `1237664721814903296`).
- **Unidad de Medida**: Adimensional (Identificador).
- **Valores**: Mínimo = `1.2376e+18`, Máximo = `1.2377e+18`, Valores únicos = `80,846`.
- **Nulos**: `0`.
- **Importancia**: Identificación única del objeto fotométrico.
- **Uso en Machine Learning**: **EXCLUIR**. Su inclusión provocaría fuga de información (data leakage) o sobreajuste espurio.

---

### 2. `alpha` (Right Ascension - $\alpha$)
- **Descripción Científica**: Ascensión recta en el sistema ecuatorial celeste (J2000). Es el equivalente celeste a la longitud geográfica terrestre, medido a lo largo del ecuador celeste desde el punto vernal.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Grados sexagesimales ($\circ$), rango $[0^\circ, 360^\circ)$.
- **Valores**: Mínimo = `0.0055^\circ`, Máximo = `359.9998^\circ`, Media = `177.63^\circ`, Mediana = `180.70^\circ`, Desv. Estándar = `96.50^\circ`.
- **Nulos**: `0`. Valores únicos = `99,999`.
- **Importancia**: Geometría celeste fundamental. Base para el posicionamiento tridimensional en la esfera celeste.
- **Uso en Machine Learning**: **VARIABLE PREDICTORA / INGENIERÍA DE CARACTERÍSTICAS**. Permite identificar densidades y orientaciones respecto al plano de la galaxia.

---

### 3. `delta` (Declination - $\delta$)
- **Descripción Científica**: Declinación en el sistema ecuatorial celeste (J2000). Es el equivalente celeste a la latitud geográfica, midiendo el ángulo de elevación hacia el norte ($>0$) o sur ($<0$) respecto al ecuador celeste.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Grados sexagesimales ($\circ$), rango $[-90^\circ, +90^\circ]$.
- **Valores**: Mínimo = `-18.79^\circ`, Máximo = `83.00^\circ`, Media = `24.14^\circ`, Mediana = `23.65^\circ`, Desv. Estándar = `19.64^\circ`.
- **Nulos**: `0`. Valores únicos = `99,999`.
- **Importancia**: Coordenada de declinación celeste para el cálculo de posiciones $x, y, z$ en la bóveda estelar.
- **Uso en Machine Learning**: **VARIABLE PREDICTORA / INGENIERÍA DE CARACTERÍSTICAS**.

---

### 4. `u` (Ultraviolet Filter Magnitude)
- **Descripción Científica**: Magnitud fotométrica de brillo en la banda del ultravioleta cercano, centrada aproximadamente en $\lambda \approx 3551$ Å.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Magnitud aparente inversa (escala logarítmica Pogson / sistema fotométrico asinh del SDSS).
- **Valores**: Mínimo = `-9999.00` (código de error de sensor/saturación), Máximo = `32.78`, Media (cruda) = `21.98`, Mediana = `22.18`, Desv. Estándar = `31.77`.
- **Valores tras limpieza de `-9999`**: Media $\approx 22.08$, Mínimo $\approx 10.99$, Desv. Estándar $\approx 2.25$.
- **Nulos**: `0`.
- **Importancia**: Crucial para detectar emisión térmica de alta energía típica de cuásares y estrellas jóvenes masivas calientes.
- **Uso en Machine Learning**: **PREDICTORA CLAVE** (tras limpieza de anomalías).

---

### 5. `g` (Green Filter Magnitude)
- **Descripción Científica**: Magnitud fotométrica en el filtro verde-azul, centrada en $\lambda \approx 4686$ Å.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Magnitud aparente.
- **Valores**: Mínimo = `-9999.00` (error de sensor), Máximo = `31.60`, Media = `20.53`, Mediana = `21.10`, Desv. Estándar = `31.75`.
- **Valores tras limpieza**: Media $\approx 20.63$, Mínimo $\approx 10.49$, Desv. Estándar $\approx 2.03$.
- **Nulos**: `0`.
- **Importancia**: Medición espectral de continuo estelar y continuo de emisión galáctico.
- **Uso en Machine Learning**: **PREDICTORA CLAVE**.

---

### 6. `r` (Red Filter Magnitude)
- **Descripción Científica**: Magnitud fotométrica en el filtro rojo óptico, centrada en $\lambda \approx 6165$ Å. Es la banda de referencia fotométrica principal del SDSS.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Magnitud aparente.
- **Valores**: Mínimo = `9.82`, Máximo = `29.57`, Media = `19.65`, Mediana = `20.12`, Desv. Estándar = `1.85`.
- **Nulos**: `0`. Sin valores `-9999`.
- **Importancia**: Banda de referencia estándar de calibración y flujo óptico.
- **Uso en Machine Learning**: **PREDICTORA CLAVE**.

---

### 7. `i` (Near-Infrared Filter Magnitude)
- **Descripción Científica**: Magnitud fotométrica en el infrarrojo cercano, centrada en $\lambda \approx 7481$ Å.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Magnitud aparente.
- **Valores**: Mínimo = `9.47`, Máximo = `32.14`, Media = `19.08`, Mediana = `19.41`, Desv. Estándar = `1.76`.
- **Nulos**: `0`.
- **Importancia**: Sensible a emisión estelar fría y galaxias con dispersión roja.
- **Uso en Machine Learning**: **PREDICTORA CLAVE**.

---

### 8. `z` (Infrared Filter Magnitude)
- **Descripción Científica**: Magnitud fotométrica en el filtro infrarrojo térmico/óptico lejano, centrada en $\lambda \approx 8931$ Å.
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Magnitud aparente.
- **Valores**: Mínimo = `-9999.00`, Máximo = `29.38`, Media = `18.67`, Mediana = `19.01`, Desv. Estándar = `31.73`.
- **Valores tras limpieza**: Media $\approx 18.77$, Mínimo $\approx 8.94$, Desv. Estándar $\approx 1.77$.
- **Nulos**: `0`.
- **Importancia**: Determinación de colores infrarrojos y penetración de polvo interestelar.
- **Uso en Machine Learning**: **PREDICTORA CLAVE**.

---

### 9. `run_ID`
- **Descripción Científica**: Identificador numérico de la pasada de observación (scan) del telescopio del SDSS.
- **Tipo de Dato**: `int64`.
- **Unidad de Medida**: Identificador operacional.
- **Valores**: Rango `[109, 8162]`, Media = `4481.37`.
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Metadato puramente técnico de calibración instrumental.

---

### 10. `rerun_ID`
- **Descripción Científica**: Identificador de la versión del algoritmo de procesamiento y reducción de imágenes utilizado.
- **Tipo de Dato**: `int64`.
- **Unidad de Medida**: Identificador operacional.
- **Valores**: Valor único constante = `301` para el 100% de los registros.
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Varianza cero ($std=0$), carece de información predictiva.

---

### 11. `cam_col`
- **Descripción Científica**: Columna de la cámara CCD (de 1 a 6) en la matriz focal del telescopio.
- **Tipo de Dato**: `int64`.
- **Valores**: Enteros del 1 al 6.
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Configuración geométrica de la cámara del telescopio.

---

### 12. `field_ID`
- **Descripción Científica**: Identificador del campo fotométrico de 13 arcminutos a lo largo de la columna de escaneo.
- **Tipo de Dato**: `int64`.
- **Valores**: Rango `[11, 989]`.
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Identificador de cuadrícula de escaneo.

---

### 13. `spec_obj_ID`
- **Descripción Científica**: Identificador único global de 64 bits para el espectro astronómico procesado.
- **Tipo de Dato**: `float64` / `int64`.
- **Valores**: 100,000 valores únicos (uno para cada registro).
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Fuga directa de identidad de la muestra espectral.

---

### 14. `class`
- **Descripción Científica**: Clasificación astrofísica del objeto: `GALAXY`, `STAR`, `QSO`.
- **Tipo de Dato**: `string` (categórica nominal).
- **Valores**: `GALAXY` (59,445), `STAR` (21,594), `QSO` (18,961).
- **Nulos**: `0`.
- **Uso en Machine Learning**: **VARIABLE OBJETIVO (TARGET)**.

---

### 15. `redshift` ($z$)
- **Descripción Científica**: Desplazamiento Doppler relativo de las líneas espectrales: $z = \frac{\lambda_{obs} - \lambda_{emit}}{\lambda_{emit}}$.
  - Para estrellas locales: $z \approx 0$ (velocidad radial pequeña). Valores negativos leves indican corrimiento al azul (blueshift) por movimiento hacia el observador.
  - Para galaxias: $0.001 < z \lesssim 0.8$ (expansión cosmológica de Hubble).
  - Para quásares (QSO): $z$ alto, frecuentemente $0.5 < z < 7.0$ (núcleos lejanos observados en el universo primitivo).
- **Tipo de Dato**: `float64`.
- **Unidad de Medida**: Adimensional ($z$).
- **Valores**: Mínimo = `-0.00997`, Máximo = `7.0112`, Media = `0.5767`, Mediana = `0.4253`, Desv. Estándar = `0.7308`.
- **Nulos**: `0`.
- **Importancia**: La característica física con mayor poder discriminante entre estrellas y fuentes cosmológicas extragalácticas.
- **Uso en Machine Learning**: **PREDICTORA CRUCIAL**. Evaluada en modelo espectrofotométrico completo.

---

### 16. `plate`
- **Descripción Científica**: Número de identificación de la placa metálica de aluminio perforada usada en el telescopio para sujetar las fibras ópticas en cada noche de observación.
- **Tipo de Dato**: `int64`.
- **Valores**: Rango `[266, 12547]`, Media = `5137.01`.
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Metadato instrumental de soporte físico de observación.

---

### 17. `MJD` (Modified Julian Date)
- **Descripción Científica**: Fecha Juliana Modificada en la que se obtuvo el espectro: $MJD = JD - 2400000.5$. Indica el día exacto de la observación.
- **Tipo de Dato**: `int64`.
- **Unidad de Medida**: Días terrestres continuos.
- **Valores**: Rango `[51608, 58932]` (abarcando observaciones desde marzo de 2000 hasta febrero de 2020).
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Metadato temporal de la campaña de observación.

---

### 18. `fiber_ID`
- **Descripción Científica**: Número de la fibra óptica específica (de 1 a 1000) en el espectrógrafo que captó la luz del objeto.
- **Tipo de Dato**: `int64`.
- **Valores**: Rango `[1, 1000]`.
- **Nulos**: `0`.
- **Uso en Machine Learning**: **EXCLUIR**. Metadato de ranura instrumental.

---

## 3. Variables Derivadas / Ingeniería de Características Astrofísicas

En astrofísica observacional, los colores o **índices de color** eliminan la dependencia de la distancia y el brillo aparente absoluto, midiendo directamente la forma del espectro de emisión:

1. **`u - g`**: Índice ultravioleta-verde (sensible a emisión no térmica y discontinuidad de Balmer).
2. **`g - r`**: Índice verde-rojo (sensible a la temperatura fotosférica y clasificación estelar/galáctica).
3. **`r - i`**: Índice rojo-infrarrojo.
4. **`i - z`**: Índice infrarrojo cercano.
5. **Estimación de distancia cosmológica comóvil $D_C(z)$** (para Galaxias y Cuásares en el visor 3D espacial) utilizando el modelo estándar $\Lambda\text{CDM}$:
   $$D_C(z) = \frac{c}{H_0} \int_0^z \frac{dz'}{\sqrt{\Omega_M(1+z')^3 + \Omega_\Lambda}}$$
   con $H_0 = 70\text{ km/s/Mpc}$, $\Omega_M = 0.3$, $\Omega_\Lambda = 0.7$.

