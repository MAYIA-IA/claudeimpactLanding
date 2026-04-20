import { useState, useRef, useEffect } from 'react'
import './DocsSection.css'
import type { JSX } from 'react'

// ── Types ────────────────────────────────────────────────
type TabId = 'intro' | 'architecture' | 'install' | 'tools' | 'pipeline' | 'usecases'

interface Tab {
  id: TabId
  label: string
  icon: string
}

interface Tool {
  name: string
  desc: string
  category: string
  params: { name: string; type: string; required: boolean; desc: string }[]
}

interface UseCase {
  icon: string
  title: string
  who: string
  prompt: string
  tools: string[]
  result: string
}

// ── Static data ──────────────────────────────────────────
const TABS: Tab[] = [
  { id: 'intro',        label: 'Introducción', icon: '◈' },
  { id: 'architecture', label: 'Arquitectura', icon: '⬡' },
  { id: 'install',      label: 'Instalación',  icon: '◆' },
  { id: 'tools',        label: 'Herramientas', icon: '◇' },
  { id: 'pipeline',     label: 'Pipeline ETL', icon: '▸' },
  { id: 'usecases',     label: 'Casos de uso', icon: '◉' },
]

const TOOLS: Tool[] = [
  {
    name: 'listar_fuentes_de_datos',
    category: 'Descubrimiento',
    desc: 'Lista todos los datasets disponibles en el catálogo. Filtra por grupo temático (movilidad, salud, seguridad…). Punto de entrada recomendado cuando no conoces qué datos existen.',
    params: [
      { name: 'grupo', type: 'string', required: false, desc: 'Nombre del grupo temático para filtrar (ej. "movilidad")' },
    ],
  },
  {
    name: 'buscar_datasets_por_texto',
    category: 'Descubrimiento',
    desc: 'Búsqueda semántica por texto libre sobre títulos, tags y grupos. Implementa scoring de relevancia con bonus por coincidencia exacta de frase. Normaliza acentos automáticamente.',
    params: [
      { name: 'texto',  type: 'string', required: true,  desc: 'Término de búsqueda en lenguaje natural, sin necesidad de nombres exactos' },
      { name: 'top_k',  type: 'number', required: false, desc: 'Número máximo de resultados a retornar (default: 5)' },
    ],
  },
  {
    name: 'obtener_metadatos_dataset',
    category: 'Descubrimiento',
    desc: 'Devuelve metadatos completos de un dataset: organización responsable, grupo temático, tags, fechas de creación/modificación, URL de origen y número de filas y columnas.',
    params: [
      { name: 'name', type: 'string', required: true, desc: 'Slug (name) del dataset. Usa listar_fuentes_de_datos para obtenerlo' },
    ],
  },
  {
    name: 'obtener_esquema_dataset',
    category: 'Descubrimiento',
    desc: 'Devuelve los nombres y tipos de columnas de un dataset via DuckDB DESCRIBE. Siempre llama esta tool antes de escribir una query SQL para evitar errores por nombres incorrectos.',
    params: [
      { name: 'name', type: 'string', required: true, desc: 'Slug del dataset a inspeccionar' },
    ],
  },
  {
    name: 'consultar_datos_sql',
    category: 'Consulta',
    desc: 'Ejecuta una query SQL SELECT arbitraria contra un dataset Parquet. El dataset se expone como una DuckDB VIEW con el nombre del slug. Solo permite SELECT; aplica LIMIT 100 automáticamente si no está en la query.',
    params: [
      { name: 'name',      type: 'string', required: true, desc: 'Slug del dataset (usado como nombre de la VIEW en DuckDB)' },
      { name: 'query_sql', type: 'string', required: true, desc: 'Query SQL SELECT completa. Ejemplo: SELECT col1, COUNT(*) FROM "mi-dataset" WHERE col2 = \'valor\'' },
    ],
  },
  {
    name: 'consultar_con_filtros',
    category: 'Consulta',
    desc: 'Alternativa segura a SQL crudo. Aplica filtros estructurados y selecciona columnas específicas. Valida que los nombres de columna existan en el esquema antes de ejecutar, bloqueando inyecciones SQL.',
    params: [
      { name: 'name',            type: 'string',   required: true,  desc: 'Slug del dataset' },
      { name: 'filtros',         type: 'Filtro[]', required: true,  desc: 'Array de filtros: {columna, operador (=,>,<,>=,<=,!=,LIKE,IN), valor}' },
      { name: 'columnas_salida', type: 'string[]', required: false, desc: 'Lista de columnas a retornar. Si se omite, retorna todas' },
      { name: 'limit',           type: 'number',   required: false, desc: 'Límite de filas (default: 100)' },
    ],
  },
  {
    name: 'buscar_valor_en_columna',
    category: 'Consulta',
    desc: 'Búsqueda parcial case-insensitive (ILIKE) sobre una columna específica. Ideal para buscar nombres de colonias, alcaldías, instituciones o cualquier valor de texto sin conocer el valor exacto.',
    params: [
      { name: 'name',    type: 'string', required: true,  desc: 'Slug del dataset' },
      { name: 'columna', type: 'string', required: true,  desc: 'Nombre de la columna donde buscar' },
      { name: 'texto',   type: 'string', required: true,  desc: 'Texto parcial a buscar (case-insensitive, soporta acentos)' },
      { name: 'limit',   type: 'number', required: false, desc: 'Máximo de filas a retornar (default: 50)' },
    ],
  },
  {
    name: 'obtener_estadisticas_columna',
    category: 'Análisis',
    desc: 'Calcula estadísticas descriptivas de una columna. Para numéricas: min, max, avg, stddev, count y null_count. Para categóricas: total de valores distintos y top 20 valores por frecuencia.',
    params: [
      { name: 'name',    type: 'string', required: true, desc: 'Slug del dataset' },
      { name: 'columna', type: 'string', required: true, desc: 'Nombre de la columna a analizar' },
    ],
  },
  {
    name: 'agregar_datos',
    category: 'Análisis',
    desc: 'Agrupa y agrega datos con GROUP BY. Soporta múltiples columnas de agrupación y métricas (COUNT, SUM, AVG, MIN, MAX). Valida todos los nombres de columna contra el esquema antes de ejecutar.',
    params: [
      { name: 'name',        type: 'string',    required: true,  desc: 'Slug del dataset' },
      { name: 'agrupar_por', type: 'string[]',  required: true,  desc: 'Columnas para GROUP BY' },
      { name: 'metricas',    type: 'Metrica[]', required: true,  desc: 'Array de métricas: {columna, funcion (COUNT|SUM|AVG|MIN|MAX)}' },
      { name: 'filtros',     type: 'Filtro[]',  required: false, desc: 'Filtros opcionales aplicados antes del GROUP BY' },
      { name: 'limit',       type: 'number',    required: false, desc: 'Límite de grupos (default: 100)' },
    ],
  },
  {
    name: 'formatear_resultado',
    category: 'Presentación',
    desc: 'Convierte filas de datos JSON a formatos de presentación. Sin llamadas externas; todo se procesa en memoria. Ideal como paso final antes de entregar resultados al usuario.',
    params: [
      { name: 'filas',   type: 'object[]', required: true,  desc: 'Array de objetos planos con los datos a formatear' },
      { name: 'formato', type: 'enum',     required: true,  desc: 'markdown_table | csv | json_pretty | resumen_narrativo' },
      { name: 'titulo',  type: 'string',   required: false, desc: 'Título opcional para tablas Markdown y resúmenes narrativos' },
    ],
  },
]

const CATEGORIES = [
  { name: 'movilidad',                              label: 'Movilidad',                  icon: '🚇' },
  { name: 'medio-ambiente-y-cambio-climatico',      label: 'Medio Ambiente',              icon: '🌿' },
  { name: 'desarrollo-urbano-vivienda-y-territorio',label: 'Desarrollo Urbano',           icon: '🏗️' },
  { name: 'inclusion-y-bienestar-social',           label: 'Inclusión y Bienestar',       icon: '🤝' },
  { name: 'justicia-y-seguridad',                   label: 'Justicia y Seguridad',        icon: '⚖️' },
  { name: 'atencion-ciudadana',                     label: 'Atención Ciudadana',          icon: '📋' },
  { name: 'salud',                                  label: 'Salud',                       icon: '🏥' },
  { name: 'turismo',                                label: 'Turismo',                     icon: '🗺️' },
  { name: 'participacion-ciudadana',                label: 'Participación Ciudadana',     icon: '🗳️' },
]

const USE_CASES: UseCase[] = [
  {
    icon: '⚖️',
    title: 'Análisis de seguridad pública',
    who: 'Gobierno · Seguridad',
    prompt: '¿Cuál es la alcaldía con más carpetas de investigación abiertas en 2024 y qué tipos de delito predominan?',
    tools: ['buscar_datasets_por_texto', 'obtener_esquema_dataset', 'agregar_datos', 'formatear_resultado'],
    result: 'Tabla markdown con top 10 alcaldías y distribución de delitos por tipo',
  },
  {
    icon: '🚇',
    title: 'Afluencia del transporte público',
    who: 'Urbanistas · Planeación',
    prompt: '¿Cuántos usuarios usaron el Metro en enero 2024 y qué línea tuvo mayor afluencia diaria?',
    tools: ['listar_fuentes_de_datos', 'obtener_esquema_dataset', 'consultar_con_filtros', 'obtener_estadisticas_columna'],
    result: 'Estadísticas por línea con totales y promedios diarios',
  },
  {
    icon: '🌿',
    title: 'Calidad del aire por alcaldía',
    who: 'Academia · Investigación',
    prompt: 'Compara los niveles de PM2.5 y ozono entre las estaciones del norte y sur de la ciudad durante el último trimestre.',
    tools: ['buscar_datasets_por_texto', 'obtener_esquema_dataset', 'consultar_datos_sql', 'formatear_resultado'],
    result: 'Análisis comparativo con estadísticas descriptivas por zona geográfica',
  },
  {
    icon: '📰',
    title: 'Periodismo de datos',
    who: 'Medios · Periodistas',
    prompt: 'Dame los 5 tipos de trámite más solicitados en la CDMX y cuánto tardaron en resolverse en promedio.',
    tools: ['buscar_datasets_por_texto', 'obtener_esquema_dataset', 'agregar_datos', 'formatear_resultado'],
    result: 'Resumen narrativo listo para incluir en nota periodística',
  },
  {
    icon: '🏗️',
    title: 'Desarrollo urbano y vivienda',
    who: 'Desarrolladores · Arquitectos',
    prompt: 'Muéstrame las colonias de Cuauhtémoc con más licencias de construcción emitidas en los últimos 2 años.',
    tools: ['listar_fuentes_de_datos', 'obtener_esquema_dataset', 'consultar_con_filtros', 'agregar_datos'],
    result: 'Ranking de colonias con conteo y tipos de licencias',
  },
  {
    icon: '🤖',
    title: 'Integración con agente IA',
    who: 'Desarrolladores · DevOps',
    prompt: 'Conectar el servidor MCP a Claude Desktop o un agente OpenClaw en Telegram para consultas en lenguaje natural.',
    tools: ['analista_cdmx (prompt)', 'listar_fuentes_de_datos', 'consultar_con_filtros', 'formatear_resultado'],
    result: 'Agente especializado en datos CDMX disponible 24/7 via @MCPcdmxBot',
  },
]

// ── Code block helper ────────────────────────────────────
interface CodeBlockProps {
  label: string
  code: string
  highlight?: string
}

const CodeBlock = ({ label, code }: CodeBlockProps): JSX.Element => (
  <div className="docs__codeblock">
    <div className="docs__codeblock-bar">
      <span className="docs__codeblock-dot docs__codeblock-dot--r" />
      <span className="docs__codeblock-dot docs__codeblock-dot--y" />
      <span className="docs__codeblock-dot docs__codeblock-dot--g" />
      <span className="docs__codeblock-label mono">{label}</span>
    </div>
    <pre className="docs__codeblock-pre mono">{code}</pre>
  </div>
)

// ── Stat badge ───────────────────────────────────────────
interface StatProps { value: string; label: string }
const Stat = ({ value, label }: StatProps): JSX.Element => (
  <div className="docs__stat">
    <span className="docs__stat-value mono">{value}</span>
    <span className="docs__stat-label">{label}</span>
  </div>
)

// ── Tab: Introducción ────────────────────────────────────
const TabIntro = (): JSX.Element => (
  <div className="docs__content">

    {/* Hero stats */}
    <div className="docs__stat-grid">
      <Stat value="384+"  label="datasets indexados" />
      <Stat value="9"     label="categorías temáticas" />
      <Stat value="10"    label="herramientas MCP" />
      <Stat value="1"     label="ciudad, toda su data" />
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">¿Qué es MCP-MX?</h3>
      <p className="docs__p">
        <strong>MCP-MX</strong> es la primera infraestructura de código abierto que convierte el portal
        de datos abiertos de la Ciudad de México en una fuente de datos nativa para modelos de lenguaje
        grande. Implementa el estándar{' '}
        <span className="docs__inline-code mono">Model Context Protocol (MCP)</span> para que cualquier
        agente de IA pueda consultar, filtrar y analizar datos urbanos reales en lenguaje natural,
        sin APIs ad-hoc, sin preprocesamiento manual y sin acceso a bases de datos propietarias.
      </p>
      <p className="docs__p">
        El proyecto integra tres capas de ingeniería: un <strong>pipeline ETL asíncrono</strong> en
        Python que consume la API CKAN de{' '}
        <a href="https://datos.cdmx.gob.mx/" target="_blank" rel="noopener noreferrer" className="docs__link">
          datos.cdmx.gob.mx
        </a>
        , un <strong>indexador atómico</strong> ("El Cartógrafo") que organiza los datos en Parquet con
        metadatos CKAN-compatibles, y un <strong>servidor MCP</strong> en TypeScript que expone todo
        el catálogo a través de 10 herramientas con motor DuckDB embebido.
      </p>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">¿Qué problema resuelve?</h3>
      <div className="docs__callout-grid">
        {[
          {
            before: 'Antes',
            icon: '✕',
            text: 'Un periodista necesita un analista de datos, acceso a la API, código Python y horas de trabajo para responder "¿cuántos robos hubo en Iztapalapa en 2024?"',
          },
          {
            before: 'Después',
            icon: '✓',
            text: 'Con MCP-MX, la misma pregunta en lenguaje natural al agente CDMX se responde en segundos, con datos reales, fuentes citables y formato listo para publicar.',
          },
        ].map(c => (
          <div key={c.before} className={`docs__callout docs__callout--${c.icon === '✕' ? 'before' : 'after'}`}>
            <span className="docs__callout-icon mono">{c.icon}</span>
            <div>
              <div className="docs__callout-label mono">{c.before}</div>
              <p className="docs__callout-text">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Primitivas del protocolo MCP</h3>
      <p className="docs__p">
        El Model Context Protocol define tres conceptos que MCP-MX implementa completamente:
      </p>
      <div className="docs__primitives">
        {[
          {
            icon: '◇',
            title: 'Tools (10 implementadas)',
            desc: 'Funciones que el modelo invoca para descubrir, consultar, analizar y presentar datos. Desde listar el catálogo hasta ejecutar SQL arbitrario con DuckDB.',
          },
          {
            icon: '◈',
            title: 'Resources (1 catálogo completo)',
            desc: 'El catálogo maestro en mcp://catalogo/esquemas expone todos los datasets con nombre, organización, tags, columnas y número de filas como contexto estático.',
          },
          {
            icon: '◆',
            title: 'Prompts (1 analista especializado)',
            desc: 'El prompt analista_cdmx configura al modelo con reglas estrictas: verificar esquemas antes de queries, preferir filtros sobre SQL crudo, reportar errores con claridad.',
          },
        ].map(p => (
          <div key={p.title} className="docs__primitive">
            <span className="docs__primitive-icon">{p.icon}</span>
            <div>
              <div className="docs__primitive-title mono">{p.title}</div>
              <div className="docs__primitive-desc">{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Pruébalo ahora</h3>
      <div className="docs__telegram-card">
        <div className="docs__telegram-icon">✈</div>
        <div>
          <div className="docs__telegram-title">Bot de Telegram disponible 24/7</div>
          <p className="docs__telegram-desc">
            Habla con los datos de tu ciudad directamente desde Telegram. Sin instalación, sin código.
            Cualquier pregunta sobre movilidad, seguridad, salud o medio ambiente de la CDMX.
          </p>
          <a
            href="https://t.me/MCPcdmxBot"
            target="_blank"
            rel="noopener noreferrer"
            className="docs__telegram-link mono"
          >
            @MCPcdmxBot →
          </a>
        </div>
      </div>
    </div>

  </div>
)

// ── Tab: Arquitectura ─────────────────────────────────────
const TabArchitecture = (): JSX.Element => (
  <div className="docs__content">

    <div className="docs__section">
      <h3 className="docs__h3">Tres capas, un pipeline</h3>
      <p className="docs__p">
        MCP-MX se compone de tres capas independientes y desacopladas que se comunican a través de
        archivos Parquet e{' '}
        <span className="docs__inline-code mono">index.json</span>. Esto permite actualizar cada
        capa sin afectar las demás.
      </p>

      <div className="docs__layers">

        {/* Layer 1 */}
        <div className="docs__layer">
          <div className="docs__layer-header">
            <span className="docs__layer-num mono">01</span>
            <div>
              <div className="docs__layer-title">data_ingestion/ — Pipeline ETL</div>
              <div className="docs__layer-sub mono">Python 3.11 · uv · polars · pyarrow · tenacity</div>
            </div>
          </div>
          <p className="docs__p">
            Consume la API CKAN de datos.cdmx.gob.mx de forma asíncrona sobre 9 categorías temáticas.
            Descarga CSVs, los transforma a Parquet columnar con Apache Arrow y genera metadatos
            CKAN-compatibles de 13 campos con IDs SHA-1 determinísticos.
          </p>
          <div className="docs__layer-modules">
            {[
              { name: 'downloader.py',   role: 'Descarga asíncrona vía CKAN API' },
              { name: 'transformer.py',  role: 'CSV → Parquet con polars + pyarrow' },
              { name: 'indexer.py',      role: '"El Cartógrafo" — escribe index.json atómico' },
              { name: 'meta_builder.py', role: 'Fábrica de metadatos CKAN (13 campos, SHA-1)' },
            ].map(m => (
              <div key={m.name} className="docs__layer-module">
                <span className="docs__layer-module-name mono">{m.name}</span>
                <span className="docs__layer-module-role">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="docs__layer-arrow">
          <div className="docs__layer-arrow-line" />
          <span className="docs__layer-arrow-label mono">shared_data/index.json + *.parquet</span>
          <div className="docs__layer-arrow-line" />
        </div>

        {/* Layer 2 */}
        <div className="docs__layer">
          <div className="docs__layer-header">
            <span className="docs__layer-num mono">02</span>
            <div>
              <div className="docs__layer-title">scrapers/ — Adaptadores de fuentes sin API</div>
              <div className="docs__layer-sub mono">Python 3.11 · beautifulsoup4 · httpx · pyyaml</div>
            </div>
          </div>
          <p className="docs__p">
            Adaptadores para fuentes de datos que no exponen una API CKAN estándar (ej. MERCOMUNA).
            Cada scraper produce metadatos sintéticos 100% compatibles con el formato CKAN
            mediante <span className="docs__inline-code mono">meta_builder.py</span>: UUID v5
            determinísticos por ruta de archivo, slugificación unicodedata y deduplicación de tags.
          </p>
          <div className="docs__layer-modules">
            {[
              { name: 'meta_builder.py',  role: 'Produce dict CKAN con 13 campos exactos, sin efectos secundarios' },
              { name: 'BaseScraper',      role: 'Clase base: get_metadata(), run(), logging estandarizado' },
            ].map(m => (
              <div key={m.name} className="docs__layer-module">
                <span className="docs__layer-module-name mono">{m.name}</span>
                <span className="docs__layer-module-role">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="docs__layer-arrow">
          <div className="docs__layer-arrow-line" />
          <span className="docs__layer-arrow-label mono">STDIO (MCP Protocol)</span>
          <div className="docs__layer-arrow-line" />
        </div>

        {/* Layer 3 */}
        <div className="docs__layer docs__layer--highlight">
          <div className="docs__layer-header">
            <span className="docs__layer-num mono">03</span>
            <div>
              <div className="docs__layer-title">mcp_server/ — Servidor MCP</div>
              <div className="docs__layer-sub mono">TypeScript · DuckDB · @modelcontextprotocol/sdk · Zod</div>
            </div>
          </div>
          <p className="docs__p">
            Servidor MCP con transporte STDIO que lee el índice con validación Zod estricta,
            construye un caché de esquemas via DuckDB en startup, y expone 10 herramientas,
            1 recurso de catálogo y 1 prompt especializado. Solo acepta queries SELECT;
            aplica LIMIT 100 automáticamente; valida nombres de columna contra el esquema
            antes de ejecutar cualquier consulta.
          </p>
          <div className="docs__layer-modules">
            {[
              { name: 'loader.ts',       role: 'Lee index.json y resuelve rutas Parquet con validación Zod' },
              { name: 'schemaCache.ts',  role: 'Introspección de columnas via DuckDB DESCRIBE en startup' },
              { name: 'duckdbEngine.ts', role: 'Motor SQL embebido: solo SELECT, LIMIT automático, VIEW por slug' },
              { name: 'tools/ (×10)',    role: '10 herramientas: descubrimiento, consulta, análisis, presentación' },
              { name: 'resources/ (×1)', role: 'Catálogo maestro en mcp://catalogo/esquemas (snapshot estático)' },
              { name: 'prompts/ (×1)',   role: 'Prompt analista_cdmx con 7 reglas de uso seguro y eficiente' },
            ].map(m => (
              <div key={m.name} className="docs__layer-module">
                <span className="docs__layer-module-name mono">{m.name}</span>
                <span className="docs__layer-module-role">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Stack tecnológico</h3>
      <div className="docs__tech-grid">
        {[
          { tech: 'Python 3.11+',            role: 'ETL Pipeline',           color: 'blue' },
          { tech: 'TypeScript 5.x',           role: 'MCP Server',             color: 'blue' },
          { tech: 'DuckDB 1.x',              role: 'Motor SQL embebido',     color: 'coral' },
          { tech: 'Apache Parquet',           role: 'Almacenamiento columnar', color: 'coral' },
          { tech: 'Apache Arrow (pyarrow)',   role: 'Serialización binaria',  color: 'peach' },
          { tech: 'polars',                   role: 'DataFrames en Rust',     color: 'peach' },
          { tech: 'MCP SDK (@anthropic)',     role: 'Protocolo estándar',     color: 'coral' },
          { tech: 'Zod',                      role: 'Validación de esquemas', color: 'blue' },
          { tech: 'tenacity',                 role: 'Reintentos exponenciales', color: 'peach' },
          { tech: 'pyyaml',                   role: 'Configuración',          color: 'blue' },
        ].map(t => (
          <div key={t.tech} className={`docs__tech-badge docs__tech-badge--${t.color}`}>
            <span className="docs__tech-name mono">{t.tech}</span>
            <span className="docs__tech-role">{t.role}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Garantías de diseño</h3>
      <div className="docs__guarantees">
        {[
          { icon: '⚛', title: 'Escritura atómica',       desc: 'index.json nunca queda a medio escribir. El indexer usa os.replace() garantizando consistencia aunque el servidor MCP esté leyendo concurrentemente.' },
          { icon: '◈', title: 'IDs determinísticos',      desc: 'Cada dataset tiene un SHA-1 estable basado en scraper_id + base_url. Cada recurso tiene un UUID v5 basado en la ruta del archivo. Reproducible entre ejecuciones.' },
          { icon: '◇', title: 'Solo SELECT',              desc: 'El motor DuckDB solo acepta queries que comienzan con SELECT. Ninguna herramienta puede mutar, borrar ni escribir datos.' },
          { icon: '◆', title: 'Validación de columnas',  desc: 'consultar_con_filtros, agregar_datos y buscar_valor_en_columna verifican que los nombres de columna existan en el esquema antes de ejecutar, previniendo SQL injection por nombre.' },
        ].map(g => (
          <div key={g.title} className="docs__guarantee">
            <span className="docs__guarantee-icon">{g.icon}</span>
            <div>
              <div className="docs__guarantee-title">{g.title}</div>
              <div className="docs__guarantee-desc">{g.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>
)

// ── Tab: Instalación ─────────────────────────────────────
const TabInstall = (): JSX.Element => (
  <div className="docs__content">

    <div className="docs__section">
      <h3 className="docs__h3">Opción 1 — npx (sin clonar el repositorio)</h3>
      <p className="docs__p">
        La forma más rápida de conectar el servidor MCP a Claude Desktop. Requiere tener{' '}
        <span className="docs__inline-code mono">shared_data/</span> con los datos ya procesados
        o apuntar a una ruta existente.
      </p>
      <CodeBlock
        label="bash"
        code={`npx @mcpmx/server --data-path /ruta/a/shared_data`}
      />
      <CodeBlock
        label="claude_desktop_config.json"
        code={`{
  "mcpServers": {
    "mcp-mx": {
      "command": "npx",
      "args": ["-y", "@mcpmx/server"],
      "env": {
        "SHARED_DATA_PATH": "/ruta/a/shared_data"
      }
    }
  }
}`}
      />
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Opción 2 — Clonar y compilar</h3>
      <div className="docs__prereqs" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: '◈', name: 'Node.js',    version: '≥ 18.x' },
          { icon: '⬡', name: 'Python',     version: '≥ 3.11' },
          { icon: '◆', name: 'uv',         version: 'pip install uv' },
          { icon: '◇', name: 'npm',        version: '≥ 9.x' },
        ].map(p => (
          <div key={p.name} className="docs__prereq">
            <span className="docs__prereq-icon">{p.icon}</span>
            <span className="docs__prereq-name mono">{p.name}</span>
            <span className="docs__prereq-version mono">{p.version}</span>
          </div>
        ))}
      </div>

      {[
        {
          step: '01',
          title: 'Clonar el repositorio',
          code: `git clone https://github.com/mayia-team-hack/MCP-MX.git\ncd MCP-MX`,
          lang: 'bash',
        },
        {
          step: '02',
          title: 'Instalar dependencias Python (ETL pipeline)',
          code: `uv venv\nsource .venv/bin/activate  # Windows: .venv\\Scripts\\activate\nuv sync`,
          lang: 'bash',
        },
        {
          step: '03',
          title: 'Correr el pipeline de ingesta (poblar shared_data/)',
          code: `./data_ingestion/run_ingestion.sh\n# Descarga ~384 datasets en 9 categorías de datos.cdmx.gob.mx`,
          lang: 'bash',
        },
        {
          step: '04',
          title: 'Compilar el servidor MCP',
          code: `cd mcp_server\nnpm install\nnpm run build`,
          lang: 'bash',
        },
        {
          step: '05',
          title: 'Iniciar el servidor MCP',
          code: `node dist/index.js --data-path ../shared_data\n# [mcp-mx] SHARED_DATA_PATH = .../shared_data\n# [mcp-mx] Loaded 384 dataset(s) from index.json\n# [mcp-mx] MCP server started (STDIO transport)`,
          lang: 'bash',
        },
      ].map(s => (
        <div key={s.step} className="docs__step">
          <div className="docs__step-num mono">{s.step}</div>
          <div className="docs__step-body">
            <div className="docs__step-title">{s.title}</div>
            <CodeBlock label={s.lang} code={s.code} />
          </div>
        </div>
      ))}
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Configurar en Claude Desktop</h3>
      <p className="docs__p">
        Una vez compilado, agrega esta entrada a{' '}
        <span className="docs__inline-code mono">claude_desktop_config.json</span>{' '}
        (macOS: <span className="docs__inline-code mono">~/Library/Application Support/Claude/</span>,
        Windows: <span className="docs__inline-code mono">%APPDATA%\Claude\</span>):
      </p>
      <CodeBlock
        label="claude_desktop_config.json"
        code={`{
  "mcpServers": {
    "mcp-mx": {
      "command": "node",
      "args": ["/ruta/a/MCP-MX/mcp_server/dist/index.js"],
      "env": {
        "SHARED_DATA_PATH": "/ruta/a/MCP-MX/shared_data"
      }
    }
  }
}`}
      />
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Vía Telegram (sin instalación)</h3>
      <div className="docs__telegram-card">
        <div className="docs__telegram-icon">✈</div>
        <div>
          <div className="docs__telegram-title">Acceso instantáneo desde Telegram</div>
          <p className="docs__telegram-desc">
            El agente CDMX está disponible ahora mismo en Telegram, conectado al servidor MCP vía
            OpenClaw. No requiere instalación ni configuración. Escribe cualquier pregunta en español.
          </p>
          <a href="https://t.me/MCPcdmxBot" target="_blank" rel="noopener noreferrer" className="docs__telegram-link mono">
            Abrir @MCPcdmxBot en Telegram →
          </a>
        </div>
      </div>
    </div>

  </div>
)

// ── Tab: Herramientas ─────────────────────────────────────
const TOOL_CATEGORIES = ['Descubrimiento', 'Consulta', 'Análisis', 'Presentación']

const TabTools = (): JSX.Element => (
  <div className="docs__content">
    <div className="docs__section">
      <p className="docs__p">
        El servidor expone <strong>10 herramientas MCP</strong> organizadas en 4 categorías.
        Todas validan parámetros con Zod, retornan errores estructurados con{' '}
        <span className="docs__inline-code mono">code</span>,{' '}
        <span className="docs__inline-code mono">message</span> y{' '}
        <span className="docs__inline-code mono">suggestion</span>, y nunca lanzan excepciones
        no manejadas al protocolo.
      </p>
    </div>

    {TOOL_CATEGORIES.map(cat => {
      const catTools = TOOLS.filter(t => t.category === cat)
      return (
        <div key={cat} className="docs__section">
          <h3 className="docs__h3">{cat}</h3>
          <div className="docs__tools-list">
            {catTools.map(tool => (
              <div key={tool.name} className="docs__tool-card">
                <div className="docs__tool-header">
                  <span className="docs__tool-name mono">{tool.name}</span>
                  <span className="docs__tool-category mono">{tool.category}</span>
                </div>
                <p className="docs__tool-desc">{tool.desc}</p>
                <div className="docs__params">
                  <div className="docs__params-heading mono">Parámetros</div>
                  {tool.params.map(p => (
                    <div key={p.name} className="docs__param-row">
                      <span className="docs__param-name mono">{p.name}</span>
                      <span className="docs__param-type mono">{p.type}</span>
                      <span className={`docs__param-req mono docs__param-req--${p.required ? 'yes' : 'no'}`}>
                        {p.required ? 'required' : 'optional'}
                      </span>
                      <span className="docs__param-desc">{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    })}

    <div className="docs__section">
      <h3 className="docs__h3">Recurso: Catálogo de esquemas</h3>
      <div className="docs__resource-card">
        <div className="docs__resource-uri mono">mcp://catalogo/esquemas</div>
        <div className="docs__resource-name">Catálogo completo con columnas</div>
        <p className="docs__resource-desc">
          Snapshot estático generado en el startup del servidor. Contiene para cada dataset:
          nombre, título, organización, grupos, tags, fecha de modificación, número de filas y
          el esquema completo de columnas (nombre + tipo DuckDB). Disponible como contexto
          adicional para que el modelo conozca el catálogo sin invocar herramientas.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <span className="docs__resource-mime mono">application/json</span>
          <span className="docs__resource-mime mono">snapshot at startup</span>
          <span className="docs__resource-mime mono">datasets + columns + metadata</span>
        </div>
      </div>

      <h3 className="docs__h3" style={{ marginTop: '1.5rem' }}>Prompt: Analista CDMX</h3>
      <div className="docs__resource-card">
        <div className="docs__resource-uri mono">analista_cdmx</div>
        <div className="docs__resource-name">Analista de datos especializado en CDMX</div>
        <p className="docs__resource-desc">
          Configura al modelo con 7 reglas de uso seguro y eficiente: verificar esquemas antes de
          queries, usar LIMIT 100 por defecto, preferir consultar_con_filtros sobre SQL crudo,
          buscar el dataset por texto antes de asumir nombres, reportar errores con sugerencias
          de corrección y priorizar queries eficientes en datasets grandes.
        </p>
        <span className="docs__resource-mime mono">system prompt · 7 reglas estrictas</span>
      </div>
    </div>

  </div>
)

// ── Tab: Pipeline ETL ─────────────────────────────────────
const TabPipeline = (): JSX.Element => (
  <div className="docs__content">

    <div className="docs__section">
      <h3 className="docs__h3">Scope: 9 categorías, ~384 datasets</h3>
      <p className="docs__p">
        El pipeline consume selectivamente 9 de las categorías operativas del portal CDMX,
        excluyendo las que tienen datos desactualizados o de baja calidad. Cada ejecución descarga,
        transforma e indexa solo los datasets modificados (sync incremental).
      </p>
      <div className="docs__category-grid">
        {CATEGORIES.map(c => (
          <div key={c.name} className="docs__category-pill">
            <span className="docs__category-icon">{c.icon}</span>
            <div>
              <div className="docs__category-label">{c.label}</div>
              <div className="docs__category-slug mono">{c.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">meta_builder.py — Fábrica de metadatos</h3>
      <p className="docs__p">
        Módulo de función pura (zero side effects) que recibe parámetros y retorna un dict Python
        con exactamente 13 campos CKAN-compatibles. Nunca escribe a disco. Diseñado para ser
        llamado desde cualquier scraper o adaptador sin acoplamientos.
      </p>
      <div className="docs__fields-grid">
        {[
          { field: 'source',             type: 'str',       desc: 'Origen del dato (ckan / scraper)' },
          { field: 'id',                 type: 'str',       desc: 'SHA-1 de scraper_id + base_url (determinístico)' },
          { field: 'name',               type: 'str',       desc: 'Slug unicodedata normalizado (URL-safe)' },
          { field: 'title',              type: 'str',       desc: 'Título legible del dataset' },
          { field: 'description',        type: 'str',       desc: 'Descripción del dataset' },
          { field: 'metadata_created',   type: 'str ISO8601', desc: 'Fecha de creación original (preservada entre runs)' },
          { field: 'metadata_modified',  type: 'str ISO8601', desc: 'Timestamp UTC de la última modificación' },
          { field: 'groups',             type: 'list[dict]', desc: 'Categorías temáticas [{name, display_name}]' },
          { field: 'organization',       type: 'dict',      desc: 'Organización responsable {name, title}' },
          { field: 'tags',               type: 'list[dict]', desc: 'Tags YAML + inferidos del DataFrame [{name}]' },
          { field: 'resources',          type: 'list[dict]', desc: 'Recursos físicos con UUID v5 determinístico por ruta' },
          { field: 'source_url',         type: 'str',       desc: 'URL de la fuente original' },
          { field: 'num_rows',           type: 'int',       desc: 'Número de filas del dataset' },
        ].map(f => (
          <div key={f.field} className="docs__field-row">
            <span className="docs__field-name mono">{f.field}</span>
            <span className="docs__field-type mono">{f.type}</span>
            <span className="docs__field-desc">{f.desc}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">indexer.py — "El Cartógrafo"</h3>
      <p className="docs__p">
        Módulo 100% offline que lee los metadatos en caché y los archivos Parquet físicos, los
        cruza por prefijo de resource_id (8 caracteres del UUID v5), agrupa por categoría y
        escribe un índice centralizado de forma atómica.
      </p>

      {[
        {
          step: '1',
          title: 'Carga del caché de metadatos',
          desc: 'Lee todos los archivos .json de api_metadata/ y construye un dict maestro indexado por prefijo de resource_id (8 chars del UUID v5) para lookup O(1).',
        },
        {
          step: '2',
          title: 'Escaneo de Parquets físicos',
          desc: 'Escanea recursivamente processed/*.parquet. El downloader añade los primeros 8 caracteres del resource_id al nombre del archivo antes de la extensión.',
        },
        {
          step: '3',
          title: 'Cruce Parquet ↔ Dataset',
          desc: 'Extrae el prefijo del stem del archivo (stem[-8:]) y lo busca en el índice maestro. Sin match → Parquet huérfano → "Sin Clasificar" + WARNING al logger.',
        },
        {
          step: '4',
          title: 'Agrupación por categoría oficial',
          desc: 'Para cada dataset con Parquets emparejados, extrae sus groups[].name. Un dataset multi-grupo aparece en todas sus categorías. Sin grupos → "Sin Clasificar".',
        },
        {
          step: '5',
          title: 'Escritura atómica',
          desc: 'Serializa el índice a index_tmp_{pid}.json y usa os.replace() para moverlo atómicamente a shared_data/index.json. El servidor MCP nunca lee un JSON parcial.',
        },
      ].map(s => (
        <div key={s.step} className="docs__pipeline-step">
          <div className="docs__pipeline-num mono">{s.step}</div>
          <div className="docs__pipeline-body">
            <div className="docs__pipeline-title">{s.title}</div>
            <div className="docs__pipeline-desc">{s.desc}</div>
          </div>
        </div>
      ))}
    </div>

    <div className="docs__section">
      <h3 className="docs__h3">Configuración del pipeline</h3>
      <CodeBlock
        label="data_ingestion/config/settings.yaml"
        code={`# 9 categorías operativas (~384 datasets)
scope:
  categories_whitelist:
    - movilidad
    - medio-ambiente-y-cambio-climatico
    - desarrollo-urbano-vivienda-y-territorio
    - inclusion-y-bienestar-social
    - justicia-y-seguridad
    - atencion-ciudadana
    - salud
    - turismo
    - participacion-ciudadana

throttling:
  delay_seconds: 1.5          # rate limiting cortés
  max_concurrent_downloads: 2
  request_timeout: 60

retry:
  max_attempts: 3
  backoff_seconds: [2, 4, 8]  # reintentos exponenciales (tenacity)`}
      />
    </div>

  </div>
)

// ── Tab: Casos de uso ─────────────────────────────────────
const TabUseCases = (): JSX.Element => (
  <div className="docs__content">
    <div className="docs__section">
      <p className="docs__p">
        Ejemplos de consultas reales que diferentes actores pueden hacer al agente CDMX
        conectado vía MCP. Cada caso muestra el prompt del usuario y las herramientas que
        el modelo invocará automáticamente para responder.
      </p>
    </div>
    <div className="docs__usecases-list">
      {USE_CASES.map(uc => (
        <div key={uc.title} className="docs__usecase-card">
          <div className="docs__usecase-header">
            <span className="docs__usecase-icon">{uc.icon}</span>
            <div>
              <div className="docs__usecase-title">{uc.title}</div>
              <div className="docs__usecase-who mono">{uc.who}</div>
            </div>
          </div>
          <div className="docs__usecase-prompt">
            <span className="docs__usecase-prompt-label mono">// consulta de ejemplo</span>
            <p className="docs__usecase-prompt-text">"{uc.prompt}"</p>
          </div>
          <div className="docs__usecase-flow">
            <span className="docs__usecase-flow-label mono">→ tools invocadas</span>
            <div className="docs__usecase-tools">
              {uc.tools.map(t => (
                <span key={t} className="docs__usecase-tool mono">{t}</span>
              ))}
            </div>
          </div>
          <div className="docs__usecase-result">
            <span className="docs__usecase-result-label mono">✓ resultado</span>
            <span className="docs__usecase-result-text">{uc.result}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ── Main component ───────────────────────────────────────
const DocsSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<TabId>('intro')
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = headRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const renderContent = (): JSX.Element => {
    switch (activeTab) {
      case 'intro':        return <TabIntro />
      case 'architecture': return <TabArchitecture />
      case 'install':      return <TabInstall />
      case 'tools':        return <TabTools />
      case 'pipeline':     return <TabPipeline />
      case 'usecases':     return <TabUseCases />
    }
  }

  return (
    <section id="docs" className="docs">
      <div className="docs__grid-lines" />

      <div className="container">
        {/* Header */}
        <div ref={headRef} className="docs__header reveal-up">
          <span className="docs__eyebrow mono">// Documentación técnica</span>
          <h2 className="docs__title">El estándar de datos abiertos para IA</h2>
          <p className="docs__subtitle">
            De datos.cdmx.gob.mx a lenguaje natural. Sin APIs ad-hoc, sin preprocesamiento,
            sin fricción. Solo preguntas y respuestas con datos reales.
          </p>
        </div>

        {/* Layout */}
        <div className="docs__layout">

          {/* Sidebar */}
          <aside className="docs__sidebar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`docs__tab ${activeTab === tab.id ? 'docs__tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="docs__tab-icon">{tab.icon}</span>
                <span className="docs__tab-label">{tab.label}</span>
              </button>
            ))}
            <div className="docs__sidebar-footer">
              <a
                href="https://github.com/mayia-team-hack/MCP-MX"
                target="_blank"
                rel="noopener noreferrer"
                className="docs__sidebar-gh mono"
              >
                ⌥ Ver en GitHub →
              </a>
              <div className="docs__sidebar-qr">
                <a href="https://t.me/MCPcdmxBot" target="_blank" rel="noopener noreferrer">
                  <img
                    src="/QR_telegram.jpeg"
                    alt="QR Telegram @MCPcdmxBot"
                    className="docs__sidebar-qr-img"
                  />
                </a>
                <span className="docs__sidebar-qr-label mono">@MCPcdmxBot</span>
              </div>
            </div>
          </aside>

          {/* Panel */}
          <div className="docs__panel">
            {renderContent()}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DocsSection
