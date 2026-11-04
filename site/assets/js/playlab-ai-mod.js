/**
 * ============================================================================
 * PLAY LAB — LABORATORIO DE IA (TOTAL CONVERSION ENGINE)
 * Transforms Code.org Minecraft Hour of Code into an AI Data Center Simulator
 * ============================================================================
 */
(function () {
  'use strict';

  // Fallback analytics stubs to prevent Code Studio trackEvent errors
  if (typeof window.trackEvent !== 'function') {
    window.trackEvent = function () {};
  }
  if (typeof window.ga !== 'function') {
    window.ga = function () {};
  }

  // ── 1. THE 14 MISSIONS FOR LAB 1: OPENAI CORE (DATA CENTER & NODOS) ────────
  var MISSIONS_MC = {
    1: {
      title: 'Misión 01 // Sincronización de Unidad',
      short: 'Bienvenido a **Play Lab — Laboratorio de IA**. Añade un segundo bloque `avanzar` para llegar hasta el **Bot de Datos** y sincronizar el primer paquete.',
      long: 'Bienvenido al Centro de Datos de **Play Lab — Laboratorio de IA**. Para iniciar el entrenamiento del modelo, añade un segundo bloque `avanzar` y conéctalo para llegar hasta el **Bot de Datos**.',
      hints: [
        'Arrastra un bloque `avanzar` desde el panel izquierdo y encájalo debajo del otro bloque `avanzar`, luego pulsa **Ejecutar IA**.'
      ]
    },
    2: {
      title: 'Misión 02 // Reciclaje de Racks Obsoletos',
      short: 'Los servidores antiguos consumen demasiada energía. Avanza hasta el **Rack de Servidor** y usa el comando `desmontar nodo` para liberar espacio en el cluster.',
      long: 'Los servidores antiguos consumen demasiada energía en el Data Center. Camina hacia el **Rack de Servidor** frente a ti y ejecuta el comando `desmontar nodo` para reciclar su hardware.',
      hints: [
        'Necesitas usar `avanzar` dos veces para quedar justo frente al Rack de Servidor.',
        'Al final de los dos bloques `avanzar`, encaja el bloque `desmontar nodo`.'
      ]
    },
    3: {
      title: 'Misión 03 // Contención de IA Rebelde',
      short: '¡Uno de los agentes de IA se ha rebelado! Debes apagar la máquina, para mayor seguridad golpéala hasta romperla.',
      long: '¡Alerta crítica en el laboratorio! Uno de los agentes de IA se ha rebelado y tomado el control de los nodos. Debes apagar la máquina: acércate y usa el comando `apagar máquina` para golpearla hasta romperla y neutralizar la amenaza.',
      hints: [
        'Avanza dos pasos hasta la primera máquina rebelde y usa `apagar máquina` para neutralizarla.',
        'Luego usa `girar a la derecha`, avanza hacia la segunda máquina rebelde y usa `apagar máquina`.'
      ]
    },
    4: {
      title: 'Misión 04 // Despeje del Sector de Servidores',
      short: 'Debemos ensamblar un nuevo Cluster de IA antes del ciclo nocturno. Recorre el sector y ejecuta `desmontar nodo` en los **3 Racks de Servidores** para obtener componentes.',
      long: 'Debemos construir un nuevo Cluster de IA antes del ciclo de carga máxima. Desmonta los **3 Racks de Servidores** del sector usando `desmontar nodo`, `avanzar` y los bloques de giro.',
      hints: [
        'El primer Rack ya fue programado en el código inicial; añade los bloques para ir hacia los otros dos Racks y desmontarlos.'
      ]
    },
    5: {
      title: 'Misión 05 // Construcción del Firewall Físico',
      short: 'Todo Centro de Datos seguro inicia con un blindaje perimetral. Construye la primera pared colocando los comandos `instalar` y `avanzar` dentro del bucle rosa `repetir`.',
      long: 'Todo Centro de Datos seguro inicia con un muro de contención. Ensambla los primeros 4 módulos del chasis colocando `instalar panel de servidor` y `avanzar` dentro del bucle `repetir 4 veces`.',
      hints: [
        'Pon el bloque `instalar` y debajo el bloque `avanzar` ambos **dentro** de la boca del bloque rosa `repetir`.'
      ]
    },
    6: {
      title: 'Misión 06 // Arquitectura del Cluster de IA',
      short: 'Termina de ensamblar el chasis de tu **Cluster de Servidores** siguiendo el trazado de la placa base. El bucle `repetir` hará tu código mucho más eficiente.',
      long: 'Selecciona la arquitectura de tu **Cluster de IA** y completa la instalación de los paneles de servidor sobre todo el trazado del circuito. Usa bucles `repetir` y giros para recorrer el plano.',
      hints: [
        'Usa un bucle `repetir` para cada tramo recto del plano y luego gira en cada esquina.'
      ]
    },
    7: {
      title: 'Misión 07 // Carga de Datasets Neuronales',
      short: 'Usa el comando `cargar dataset` en cada socket oscuro a ambos lados del **canal de refrigeración líquida**.',
      long: 'Usa el comando `cargar dataset` en cada socket oscuro a ambos lados del **canal de refrigeración líquida** para sincronizar la memoria del cluster.',
      hints: [
        'Usa un bucle `repetir 6 veces` con `cargar dataset` y `avanzar` para completar la primera fila, luego cruza al otro lado.'
      ]
    },
    8: {
      title: 'Misión 08 // Protocolo Anti-Malware',
      short: '¡Alerta de ciberseguridad! Se han detectado **Bots de Malware** en el pasillo. Si los tocas, provocarán un fallo crítico. Esquívalos con cuidado y entra a tu **Cluster Seguro**.',
      long: '¡Alerta de ciberseguridad! Se han infiltrado **Bots de Malware** (rojos) en el laboratorio. No te acerques a ellos: rodéalos por los pasillos despejados hasta entrar a tu **Cluster de Servidores**.',
      hints: [
        'Usa bloques `repetir`, `avanzar` y `girar` para trazar una ruta segura que rodee a los Bots de Malware sin chocar con ellos.'
      ]
    },
    9: {
      title: 'Misión 09 // Subsuelo del Laboratorio: Nodos de Energía',
      short: 'En el nivel subterráneo del Data Center se encuentran los procesadores de respaldo, pero está oscuro. Instala al menos **2 balizas ópticas** y extrae al menos **2 Nodos de Silicio**.',
      long: 'En el nivel profundo del laboratorio están los núcleos de energía, pero los sensores requieren iluminación. Usa `instalar baliza óptica` al menos **2 veces** y `desmontar nodo` en al menos **2 Nodos de Silicio**.',
      hints: [
        'Primero gira y desmonta los dos bloques frente a ti, y no olvides usar `instalar baliza óptica` dos veces.'
      ]
    },
    10: {
      title: 'Misión 10 // Puente de Contención Térmica',
      short: 'Cruzar sobre una **zona de sobrecalentamiento** destruirá tus circuitos. Usa `instalar placa térmica delante` para tender un puente seguro y luego extrae al menos **2 Clusters de CPU**.',
      long: 'El núcleo subterráneo presenta fugas de plasma térmico. Usa `instalar delante` para cubrir el sobrecalentamiento con una **placa térmica**, cruza el puente y extrae al menos **2 Clusters de CPU** del otro lado.',
      hints: [
        'Avanza hasta el borde de la zona roja de sobrecalentamiento, usa `instalar placa térmica delante` y luego avanza sobre ella.'
      ]
    },
    11: {
      title: 'Misión 11 // Sensores Condicionales de Temperatura',
      short: 'Hay **sobrecalentamiento** oculto bajo algunos nodos. Tendrás que sellarlo antes de avanzar. Usa el condicional `si hay sobrecalentamiento delante` junto con un bloque `avanzar` en el lugar correcto para extraer los procesadores.',
      long: 'Hay fugas térmicas debajo de algunos de estos nodos de hardware. El bloque condicional `si hay sobrecalentamiento delante` verificará automáticamente el suelo e instalará una placa térmica si detecta peligro.',
      hints: [
        'Dentro del bucle `repetir 7 veces`, después del bloque `si hay sobrecalentamiento delante`, añade un bloque `avanzar`.'
      ]
    },
    12: {
      title: 'Misión 12 // Extracción de GPUs Tensoriales (H100)',
      short: '¡Fase crítica del entrenamiento! Extrae los **3 Nodos de GPUs Tensoriales** pero evita caer en el sobrecalentamiento. Usa el comando condicional `si hay sobrecalentamiento delante` para instalar placas térmicas donde sea necesario.',
      long: 'Necesitamos **3 Nodos de GPUs Tensoriales** (rojos brillantes) para el supercomputador. Combina bucles `repetir`, `desmontar nodo` y `si hay sobrecalentamiento delante` para navegar de forma segura.',
      hints: [
        'Siempre que desmontes un nodo, verifica primero con `si hay sobrecalentamiento delante` → `instalar placa térmica delante` antes de avanzar a esa casilla.'
      ]
    },
    13: {
      title: 'Misión 13 // Bus de Fibra Óptica de Alta Velocidad',
      short: '¡Excelente trabajo de ingeniería! Ya tienes los datos, el Cluster y las GPUs. Ahora tiende un cable de `fibra óptica` a lo largo del canal de bus desde el puerto exterior hasta la puerta de tu Cluster.',
      long: '¡Excelente trabajo! Para conectar tu Cluster a internet de ultra-alta velocidad, instala `fibra óptica` a lo largo de todo el canal de bus hasta llegar a la entrada de tu Centro de Datos.',
      hints: [
        'Usa dos bucles `repetir 6 veces` que contengan `instalar fibra óptica` y `avanzar`, girando en la esquina del recorrido.'
      ]
    },
    14: {
      title: 'Misión 14 // Modo Sandbox: Arquitecto Jefe de IA',
      short: '¡Felicitaciones! Has puesto en línea el supercomputador de **Play Lab — Laboratorio de IA**. Ahora tienes acceso total al laboratorio 20x20 para diseñar y programar tu propio Centro de Datos.',
      long: '¡Certificación completada! Has superado las 13 misiones de ingeniería de **Play Lab — Laboratorio de IA**. En este entorno libre puedes instalar nuevos servidores, extraer núcleos cuánticos y experimentar con todo lo aprendido.',
      hints: [
        '¡Explora libremente! Puedes construir nuevos clusters, tender fibra óptica o extraer núcleos cuánticos.'
      ]
    }
  };

  function getCurrentLevelNum() {
    var m = window.location.pathname.match(/\/play\/\w+\/(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  function getCurrentGameId() {
    var m = window.location.pathname.match(/\/play\/(\w+)\/\d+/);
    return m ? m[1] : 'mc';
  }

  // ── 2. PATCH APP OPTIONS (MISSION INSTRUCTIONS & HINTS) ────────────────────
  function patchLevelOptions(opts) {
    if (!opts || !opts.level) return opts;
    var lvl = getCurrentLevelNum();
    var m = MISSIONS_MC[lvl];
    if (m) {
      opts.level.shortInstructions = m.short;
      opts.level.longInstructions = m.long;
      if (m.hints && m.hints.length) {
        opts.level.authoredHints = JSON.stringify(
          m.hints.map(function (h, idx) {
            return {
              hint_class: 'content',
              hint_markdown: h,
              hint_id: 'playlab_' + lvl + '_' + idx,
              hint_type: 'general'
            };
          })
        );
      }
    }
    return opts;
  }

  // Hook JSON.parse so data-appoptions attribute on craft.min.js gets our AI missions
  var _origJsonParse = JSON.parse;
  JSON.parse = function (str) {
    var res = _origJsonParse.apply(this, arguments);
    if (res && res.level && (res.app === 'craft' || res.skinId === 'craft')) {
      patchLevelOptions(res);
    }
    return res;
  };

  // ── 3. PATCH CRAFT & COMMON LOCALES (BLOCKS, ITEMS, DIALOGS) ───────────────
  function patchLocales() {
    window.locales = window.locales || {};
    var cl = window.locales.craft_locale;
    if (cl && !cl._playlabPatched) {
      cl._playlabPatched = true;
      var overrides = {
        // Core programming blocks
        blockDestroyBlock: 'desmontar nodo',
        blockShear: 'apagar máquina',
        blockPlace: 'instalar',
        blockPlaceXAheadAhead: 'delante',
        blockPlaceXAheadPlace: 'instalar',
        blockPlaceXPlace: 'instalar',
        blockPlaceTorch: 'instalar baliza óptica',
        blockPlantCrop: 'cargar dataset',
        blockIfLavaAhead: 'si hay sobrecalentamiento delante',
        blockIf: 'si',
        blockWhileXAheadAhead: 'delante',
        blockWhileXAheadDo: 'ejecutar',
        blockWhileXAheadWhile: 'mientras',
        blockMoveForward: 'avanzar',
        blockMoveBackward: 'retroceder',
        blockTurnLeft: 'girar a la izquierda',
        blockTurnRight: 'girar a la derecha',

        // Block types in dropdowns
        blockTypeCobblestone: 'placa térmica',
        blockTypeDirt: 'canal de bus',
        blockTypeDirtCoarse: 'placa base PCB',
        blockTypeFarmlandWet: 'socket neural',
        blockTypeGrass: 'piso de servidor',
        blockTypeLava: 'sobrecalentamiento',
        blockTypeWater: 'refrigeración líquida',
        blockTypeLogAcacia: 'rack de servidor A',
        blockTypeLogBirch: 'rack de servidor B',
        blockTypeLogJungle: 'rack de servidor J',
        blockTypeLogOak: 'rack de servidor',
        blockTypeLogSpruce: 'rack de alta densidad',
        blockTypeOreCoal: 'nodo de silicio',
        blockTypeOreDiamond: 'núcleo cuántico',
        blockTypeOreEmerald: 'nodo bio-neural',
        blockTypeOreGold: 'acelerador neural',
        blockTypeOreIron: 'cluster de CPU',
        blockTypeOreLapis: 'memoria óptica',
        blockTypeOreRedstone: 'GPU tensorial',
        blockTypePlanksAcacia: 'panel de servidor A',
        blockTypePlanksBirch: 'panel de titanio',
        blockTypePlanksJungle: 'panel modular',
        blockTypePlanksOak: 'panel de servidor',
        blockTypePlanksSpruce: 'panel blindado',
        blockTypeRail: 'fibra óptica',
        blockTypeRailsRedstoneTorch: 'impulsor óptico',
        blockTypeStone: 'blindaje de titanio',
        blockTypeTree: 'rack de servidor',
        blockTypeWool: 'paquete de datos',

        // Entities & Events
        entityTypeSheep: 'bot de datos',
        entityTypeCreeper: 'bot de malware',
        entityTypeChicken: 'dron auxiliar',
        entityTypeCow: 'nodo de almacenamiento',
        entityTypeIronGolem: 'guardián de seguridad',
        entityTypePlayer: 'ingeniero de IA',
        entityTypeZombie: 'proceso corrupto',
        eventTypeWhenRun: 'al iniciar sistema',
        eventTypeWhenSpawned: 'al inicializar',
        eventTypeWhenTouched: 'al recibir señal',
        eventTypeWhenUsed: 'al activar puerto',
        eventTypeWhenAttacked: 'al detectar intrusión',
        eventTypeWhenDay: 'en ciclo diurno',
        eventTypeWhenNight: 'en ciclo nocturno',

        // Mini-blocks (inventory / floating items)
        miniBlockCobblestone: 'placa térmica',
        miniBlockCoal: 'celda de silicio',
        miniBlockDiamond: 'núcleo cuántico',
        miniBlockDirt: 'canal de bus',
        miniBlockEmerald: 'chip bio-neural',
        miniBlockIngotGold: 'acelerador neural',
        miniBlockIngotIron: 'procesador CPU',
        miniBlockLapisLazuli: 'módulo de memoria',
        miniBlockLogAcacia: 'módulo de servidor',
        miniBlockLogBirch: 'módulo de servidor B',
        miniBlockLogJungle: 'módulo de servidor J',
        miniBlockLogOak: 'módulo de servidor',
        miniBlockLogSpruce: 'módulo de servidor S',
        miniBlockPlanksAcacia: 'panel de servidor',
        miniBlockPlanksBirch: 'panel de titanio',
        miniBlockPlanksJungle: 'panel modular',
        miniBlockPlanksOak: 'panel de servidor',
        miniBlockPlanksSpruce: 'panel blindado',
        miniBlockRedstoneDust: 'núcleo GPU tensorial',
        miniBlockSheep: 'bot de datos',
        miniBlockWheat: 'dataset entrenado',
        miniBlockWool: 'paquete de datos',

        // Character & Cluster selection modals
        playerSelectChooseCharacter: 'Selecciona tu ingeniero de IA:',
        playerSelectChooseSelectButton: 'Inicializar Unidad',
        playerSelectLetsGetStarted: '¡Iniciando sistema!',
        houseSelectChooseFloorPlan: 'Selecciona la arquitectura de tu Cluster de IA:',
        houseSelectEasy: 'Compacto',
        houseSelectMedium: 'Estándar',
        houseSelectHard: 'Avanzado',
        houseSelectLetsBuild: '¡Construyamos el Cluster!',
        generatedCodeDescription: 'En esta misión programaste la lógica de tu Unidad de IA usando JavaScript, el lenguaje con el que se construyen interfaces, servidores y agentes inteligentes reales.',

        // Mission-specific failure messages
        level1FailureMessage: 'Para sincronizar con el Bot de Datos, añade otro bloque "avanzar".',
        level1TooFewBlocksMessage: 'Usa dos bloques "avanzar" para llegar hasta el Bot de Datos.',
        level2FailureMessage: 'Para reciclar el Rack de Servidor, avanza hasta él y usa el comando "desmontar nodo".',
        level2TooFewBlocksMessage: 'Avanza dos pasos hasta el Rack de Servidor y usa "desmontar nodo".',
        level3FailureMessage: 'Para recolectar los datos de entrenamiento de ambos Bots de Datos, acércate a cada uno y usa "extraer datos".',
        level3TooFewBlocksMessage: 'Camina hasta cada Bot de Datos y ejecuta el comando "extraer datos".',
        level4FailureMessage: 'Debes ejecutar el comando "desmontar nodo" frente a cada uno de los 3 Racks de Servidores.',
        level5FailureMessage: 'Instala paneles de servidor sobre el canal de bus. Coloca "instalar" y "avanzar" dentro del bucle "repetir".',
        level6FailureMessage: 'Instala paneles sobre todo el trazado de la placa base para completar el chasis del Cluster de IA.',
        level7FailureMessage: 'Usa el comando "cargar dataset" en cada socket oscuro a ambos lados del canal de refrigeración líquida.',
        level8FailureMessage: '¡Fallo de seguridad! Si tocas un Bot de Malware rojo, dañará el sistema. Esquívalos y entra al Cluster.',
        level9FailureMessage: 'Recuerda instalar al menos 2 "balizas ópticas" para iluminar los sensores Y extraer al menos 2 "nodos de silicio".',
        level10FailureMessage: 'Instala una "placa térmica" sobre la zona de sobrecalentamiento para cruzar y luego extrae 2 "clusters de CPU".',
        level11FailureMessage: 'Usa "instalar placa térmica delante" dentro del condicional "si hay sobrecalentamiento delante" para avanzar con seguridad.',
        level12FailureMessage: 'Extrae los 3 nodos de "GPU tensorial" usando bloques "si hay sobrecalentamiento delante" para no caer en las fallas térmicas.',
        level13FailureMessage: 'Tiende "fibra óptica" a lo largo de todo el canal de bus desde el extremo del mapa hasta la entrada de tu Cluster.'
      };

      Object.keys(overrides).forEach(function (k) {
        var text = overrides[k];
        cl[k] = function () { return text; };
      });

      cl.nextLevelMsg = function (e) {
        var num = (e && e.puzzleNumber) ? e.puzzleNumber : getCurrentLevelNum();
        return 'Completaste el rompecabezas ' + num + '. ¡Felicitaciones!';
      };
      cl.tooManyBlocksFail = function (e) {
        var num = (e && e.puzzleNumber) ? e.puzzleNumber : getCurrentLevelNum();
        var blocks = (e && e.numBlocks) ? e.numBlocks : '';
        return 'Completaste el rompecabezas ' + num + '. ¡Felicitaciones! También puedes completarlo con ' + blocks + ' bloques.';
      };
    }
  }

  // ── 4. 2.5D ISOMETRIC AI DATA CENTER TEXTURE ATLAS GENERATOR ───────────────
  // Redraws Minecraft tiles & sprites into high-tech Data Center / AI Lab graphics
  function drawCube40x60(ctx, x, y, topColor, frontColor, borderColor, detailFn) {
    ctx.save();
    ctx.clearRect(x, y, 40, 60);

    // Top 40x40 face
    ctx.fillStyle = topColor;
    ctx.fillRect(x, y, 40, 40);

    // Subtle inner grid border on top face
    ctx.strokeStyle = borderColor || 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, 39, 39);

    // Front 40x20 vertical face (3D depth)
    ctx.fillStyle = frontColor;
    ctx.fillRect(x, y + 40, 40, 20);

    // Bevel highlight between top and front face
    ctx.fillStyle = borderColor || 'rgba(0, 240, 255, 0.35)';
    ctx.fillRect(x, y + 39, 40, 2);

    if (detailFn) {
      detailFn(ctx, x, y);
    }
    ctx.restore();
  }

  function transformBlocksAtlas(img, atlasData) {
    if (!atlasData || !atlasData.frames) return img;
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.complete = true;
    var ctx = canvas.getContext('2d');

    // Draw original image first as base for any niche frames
    ctx.drawImage(img, 0, 0);

    var frames = atlasData.frames;
    Object.keys(frames).forEach(function (name) {
      var f = frames[name] && frames[name].frame;
      if (!f) return;
      var x = f.x, y = f.y, w = f.w, h = f.h;

      // 1. GRASS -> Data Center Floor Tile (Dark Navy-Slate Tech Grid + Corner LEDs)
      if (name === 'Grass' || name === 'grass_path') {
        drawCube40x60(ctx, x, y, '#0e1729', '#080d18', 'rgba(0, 240, 255, 0.18)', function (c, bx, by) {
          // Inner server floor panel
          c.fillStyle = '#131f36';
          c.fillRect(bx + 3, by + 3, 34, 34);
          // Micro circuit cross lines
          c.fillStyle = 'rgba(0, 240, 255, 0.12)';
          c.fillRect(bx + 19, by + 3, 2, 34);
          c.fillRect(bx + 3, by + 19, 34, 2);
          // Glowing corner status micro-LEDs
          c.fillStyle = '#00f0ff';
          c.fillRect(bx + 4, by + 4, 2, 2);
          c.fillRect(bx + 34, by + 4, 2, 2);
          c.fillStyle = '#10b981';
          c.fillRect(bx + 4, by + 34, 2, 2);
          c.fillRect(bx + 34, by + 34, 2, 2);
          // Front sub-floor bus stripe
          c.fillStyle = '#00f0ff';
          c.fillRect(bx + 4, by + 48, 32, 2);
        });
      }

      // 2. DIRT / COARSE_DIRT -> Motherboard PCB Bus Channel (Copper/Gold Data Traces)
      else if (name === 'Dirt' || name === 'Coarse_Dirt') {
        drawCube40x60(ctx, x, y, '#142221', '#0b1414', 'rgba(245, 158, 11, 0.4)', function (c, bx, by) {
          c.fillStyle = '#192c2b';
          c.fillRect(bx + 2, by + 2, 36, 36);
          // Golden PCB data bus lines
          c.fillStyle = '#f59e0b';
          for (var i = 6; i <= 32; i += 8) {
            c.fillRect(bx + i, by + 2, 2, 36);
            c.fillRect(bx + 2, by + i, 36, 1);
          }
          // IC Chip pad in center
          c.fillStyle = '#0f172a';
          c.fillRect(bx + 13, by + 13, 14, 14);
          c.strokeStyle = '#fbbf24';
          c.strokeRect(bx + 13.5, by + 13.5, 13, 13);
          c.fillStyle = '#10b981';
          c.fillRect(bx + 18, by + 18, 4, 4);
        });
      }

      // 3. FARMLAND_WET -> Neural Dataset Socket (Glowing Matrix Receptor)
      else if (name === 'Farmland_Wet') {
        drawCube40x60(ctx, x, y, '#15122b', '#0b0918', 'rgba(139, 92, 246, 0.5)', function (c, bx, by) {
          c.fillStyle = '#1e1b4b';
          c.fillRect(bx + 4, by + 4, 32, 32);
          // Socket pin slots
          for (var r = 7; r <= 29; r += 7) {
            c.fillStyle = '#8b5cf6';
            c.fillRect(bx + 6, by + r, 28, 3);
            c.fillStyle = '#00f0ff';
            c.fillRect(bx + 10, by + r + 1, 4, 1);
            c.fillRect(bx + 26, by + r + 1, 4, 1);
          }
        });
      }

      // 4. STONE / BEDROCK -> Sub-Core Titanium Armor Tile
      else if (name === 'Stone' || name === 'Bedrock') {
        var isBedrock = name === 'Bedrock';
        drawCube40x60(ctx, x, y, isBedrock ? '#090d16' : '#1e293b', isBedrock ? '#05070c' : '#0f172a', 'rgba(148, 163, 184, 0.35)', function (c, bx, by) {
          c.fillStyle = isBedrock ? '#111827' : '#27354d';
          c.fillRect(bx + 3, by + 3, 34, 34);
          // Rivets
          c.fillStyle = '#64748b';
          c.fillRect(bx + 5, by + 5, 3, 3);
          c.fillRect(bx + 32, by + 5, 3, 3);
          c.fillRect(bx + 5, by + 32, 3, 3);
          c.fillRect(bx + 32, by + 32, 3, 3);
          // Tech seam
          c.fillStyle = '#0f172a';
          c.fillRect(bx + 3, by + 19, 34, 2);
          // Front ribs
          c.fillStyle = '#334155';
          c.fillRect(bx + 6, by + 44, 6, 12);
          c.fillRect(bx + 17, by + 44, 6, 12);
          c.fillRect(bx + 28, by + 44, 6, 12);
        });
      }

      // 5. COBBLESTONE -> Thermal Containment Bridge Module
      else if (name === 'Cobblestone') {
        drawCube40x60(ctx, x, y, '#16304d', '#0c1d31', '#00f0ff', function (c, bx, by) {
          c.fillStyle = '#1e4066';
          c.fillRect(bx + 3, by + 3, 34, 34);
          // Cryo cooling grid bars
          c.fillStyle = '#00f0ff';
          for (var gy = 7; gy <= 31; gy += 8) {
            c.fillRect(bx + 6, by + gy, 28, 3);
          }
          // Front glowing shield indicator
          c.fillStyle = '#38bdf8';
          c.fillRect(bx + 6, by + 47, 28, 6);
        });
      }

      // 6. LOGS (Tree Trunks) -> High-Density AI Server Rack Units
      else if (name.indexOf('Log_') === 0 || name.indexOf('Stripped_') === 0) {
        var accent = name.indexOf('Birch') !== -1 ? '#00f0ff' : (name.indexOf('Spruce') !== -1 ? '#8b5cf6' : '#10b981');
        drawCube40x60(ctx, x, y, '#0b1120', '#050912', accent, function (c, bx, by) {
          // Top cooling fan housing
          c.fillStyle = '#111827';
          c.fillRect(bx + 3, by + 3, 34, 34);
          c.strokeStyle = accent;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(bx + 20, by + 20, 12, 0, Math.PI * 2);
          c.stroke();
          c.fillStyle = accent;
          c.beginPath();
          c.arc(bx + 20, by + 20, 4, 0, Math.PI * 2);
          c.fill();

          // Front Server Blades & Blinking Status LEDs
          for (var sy = 43; sy <= 55; sy += 5) {
            c.fillStyle = '#1e293b';
            c.fillRect(bx + 3, by + sy, 34, 4);
            c.fillStyle = accent;
            c.fillRect(bx + 5, by + sy + 1, 4, 2);
            c.fillStyle = '#00f0ff';
            c.fillRect(bx + 11, by + sy + 1, 3, 2);
            c.fillStyle = '#f59e0b';
            c.fillRect(bx + 32, by + sy + 1, 3, 2);
          }
        });
      }

      // 7. PLANKS / BRICKS -> Modular AI Cluster Firewall Walls
      else if (name.indexOf('Planks_') === 0 || name === 'Bricks' || name.indexOf('Stone_Bricks') === 0) {
        var wallAccent = name.indexOf('Birch') !== -1 ? '#00f0ff' : (name.indexOf('Spruce') !== -1 ? '#8b5cf6' : '#10b981');
        drawCube40x60(ctx, x, y, '#26354d', '#162033', wallAccent, function (c, bx, by) {
          c.fillStyle = '#334155';
          c.fillRect(bx + 3, by + 3, 34, 34);
          // Glowing neon data conduit across top of wall
          c.fillStyle = wallAccent;
          c.fillRect(bx + 6, by + 18, 28, 4);
          // Front architectural glass/metal bay
          c.fillStyle = '#0f172a';
          c.fillRect(bx + 4, by + 44, 32, 12);
          c.fillStyle = wallAccent;
          c.fillRect(bx + 6, by + 49, 28, 3);
        });
      }

      // 8. ORES -> AI Compute Hardware Nodes (Silicon, CPU, Tensor GPU, Quantum Core)
      else if (name.indexOf('_Ore') !== -1 || name === 'quartz_ore') {
        var oreColor = '#f59e0b'; // Coal -> Silicon Energy
        var oreGlow = '#fef08a';
        if (name === 'Iron_Ore') { oreColor = '#38bdf8'; oreGlow = '#e0f2fe'; } // CPU Cluster
        else if (name === 'Redstone_Ore') { oreColor = '#f43f5e'; oreGlow = '#fda4af'; } // Tensor GPU H100
        else if (name === 'Diamond_Ore') { oreColor = '#00f0ff'; oreGlow = '#cffafe'; } // Quantum Core
        else if (name === 'Emerald_Ore') { oreColor = '#10b981'; oreGlow = '#a7f3d0'; }
        else if (name === 'Gold_Ore') { oreColor = '#eab308'; oreGlow = '#fef9c3'; }
        else if (name === 'Lapis_Ore') { oreColor = '#6366f1'; oreGlow = '#e0e7ff'; }

        drawCube40x60(ctx, x, y, '#172133', '#0d1422', oreColor, function (c, bx, by) {
          // Gold/Silver microprocessor pins around chip
          c.fillStyle = '#94a3b8';
          for (var p = 10; p <= 28; p += 5) {
            c.fillRect(bx + p, by + 5, 2, 30);
            c.fillRect(bx + 5, by + p, 30, 2);
          }
          // Chip package
          c.fillStyle = '#090d16';
          c.fillRect(bx + 9, by + 9, 22, 22);
          c.strokeStyle = oreColor;
          c.lineWidth = 2;
          c.strokeRect(bx + 9, by + 9, 22, 22);
          // Glowing Tensor/Quantum Die
          c.fillStyle = oreColor;
          c.fillRect(bx + 13, by + 13, 14, 14);
          c.fillStyle = oreGlow;
          c.fillRect(bx + 16, by + 16, 8, 8);

          // Front bay core indicator
          c.fillStyle = '#090d16';
          c.fillRect(bx + 6, by + 44, 28, 12);
          c.fillStyle = oreColor;
          c.fillRect(bx + 9, by + 47, 22, 6);
          c.fillStyle = oreGlow;
          c.fillRect(bx + 15, by + 49, 10, 2);
        });
      }

      // 9. LAVA -> Overheat / Plasma Thermal Hazard Zone
      else if (name.indexOf('Lava_') === 0 || name === 'Magma_Block') {
        ctx.save();
        ctx.clearRect(x, y, w, h);
        ctx.fillStyle = '#2a050d';
        ctx.fillRect(x, y, w, h);
        // Glowing plasma thermal grid
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 5, y + 5, w - 10, Math.min(30, h - 10));
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 11, y + 11, w - 22, 16);
        // Dark hazard warning diagonal bars on front
        ctx.fillStyle = '#180408';
        ctx.fillRect(x + 4, y + 40, w - 8, 14);
        ctx.fillStyle = '#facc15';
        for (var hx = 6; hx < w - 8; hx += 8) {
          ctx.fillRect(x + hx, y + 43, 4, 8);
        }
        ctx.restore();
      }

      // 10. WATER -> Liquid Nitrogen Cryo-Cooling Channel
      else if (name.indexOf('Water_') === 0) {
        ctx.save();
        ctx.clearRect(x, y, w, h);
        ctx.fillStyle = '#042f49';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x + 2, y + 2, w - 4, 36);
        // Glowing cyan coolant flow lines
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(x + 6, y + 9, w - 12, 3);
        ctx.fillRect(x + 10, y + 19, w - 16, 3);
        ctx.fillRect(x + 6, y + 29, w - 12, 3);
        // Front cryo glow
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(x, y + 38, w, h - 38);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 4, y + 45, w - 8, 4);
        ctx.restore();
      }

      // 11. FLOWERS & TALL GRASS -> Floor Micro-Sensors, Optical Nodes & LED Beacons
      else if (name === 'TallGrass' || name.indexOf('Flower_') === 0 || name === 'dead_bush') {
        ctx.save();
        ctx.clearRect(x, y, w, h);
        var cx = x + Math.floor(w / 2);
        var cy = y + h - 10;
        var beaconColor = name === 'Flower_Rose' ? '#f43f5e' : (name === 'Flower_Dandelion' ? '#facc15' : (name === 'Flower_Oxeeye' ? '#00f0ff' : '#10b981'));

        // Small hexagonal/circular floor sensor pad
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 8, cy - 4, 16, 6);
        ctx.strokeStyle = beaconColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 8, cy - 4, 16, 6);

        // Vertical optical antennamast
        ctx.fillStyle = '#64748b';
        ctx.fillRect(cx - 2, cy - 18, 4, 14);

        // Glowing LED sensor tip
        ctx.fillStyle = beaconColor;
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1, cy - 22, 2, 2);
        ctx.restore();
      }

      // 12. RAILS -> High-Speed Fiber Optic Data Bus
      else if (name.indexOf('Rails_') === 0) {
        ctx.save();
        ctx.clearRect(x, y, w, h);
        var isVert = name.indexOf('Vertical') !== -1 || name.indexOf('RedstoneTorch') !== -1;
        var isHoriz = name.indexOf('Horizontal') !== -1;
        if (isVert) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 8, y, 24, h);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(x + 12, y, 4, h);
          ctx.fillRect(x + 24, y, 4, h);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x + 19, y, 2, h);
        } else if (isHoriz) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y + 8, w, 24);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(x, y + 12, w, 4);
          ctx.fillRect(x, y + 24, w, 4);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(x, y + 19, w, 2);
        } else {
          // Corner fiber junction
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 4;
          ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
        }
        ctx.restore();
      }

      // 13. WOOL -> Encrypted Data Storage Blocks
      else if (name.indexOf('Wool_') === 0) {
        drawCube40x60(ctx, x, y, '#0c2d48', '#071b2e', '#00f0ff', function (c, bx, by) {
          c.fillStyle = '#00f0ff';
          c.strokeRect(bx + 6, by + 6, 28, 28);
          c.fillRect(bx + 14, by + 14, 12, 12);
        });
      }
    });

    return canvas;
  }

  // Transform Tree Canopies (Leaves_Oak, Leaves_Birch, Leaves_Spruce) into 3D Server Cluster Canopies
  function transformLeavesAtlas(key, img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.complete = true;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = imgData.data;
    var w = canvas.width;

    // Color theme per server cluster type
    var isBirch = key.indexOf('Birch') !== -1;
    var isSpruce = key.indexOf('Spruce') !== -1;

    for (var i = 0; i < d.length; i += 4) {
      var a = d[i + 3];
      if (a < 20) continue;
      var r = d[i], g = d[i + 1], b = d[i + 2];
      // Preserve pure black drop shadows
      if (r < 25 && g < 25 && b < 25) continue;

      var pIdx = i / 4;
      var px = pIdx % w;
      var py = Math.floor(pIdx / w);
      var lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;

      // Grid lines & server rack LED pattern
      var isGridX = (px % 16 === 0);
      var isGridY = (py % 12 === 0);
      var isLed = (py % 12 === 6) && (px % 8 === 4) && lum > 0.32;

      if (isLed) {
        if (isBirch) { d[i] = 0; d[i + 1] = 240; d[i + 2] = 255; }
        else if (isSpruce) { d[i] = 168; d[i + 1] = 85; d[i + 2] = 247; }
        else { d[i] = 16; d[i + 1] = 185; d[i + 2] = 129; }
      } else if (isGridX || isGridY) {
        d[i] = 0;
        d[i + 1] = Math.min(255, Math.floor(180 * lum + 40));
        d[i + 2] = Math.min(255, Math.floor(230 * lum + 55));
      } else {
        // Dark metallic slate-blue server housing preserving 3D isometric shading
        d[i] = Math.floor(18 + lum * 32);
        d[i + 1] = Math.floor(28 + lum * 48);
        d[i + 2] = Math.floor(48 + lum * 75);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // Transform Sheep into AI Data Bots (with glowing Cyan Data Core when un-sheared)
  function transformSheepAtlas(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.complete = true;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = imgData.data;
    var w = canvas.width;

    for (var i = 0; i < d.length; i += 4) {
      var a = d[i + 3];
      if (a < 20) continue;
      var r = d[i], g = d[i + 1], b = d[i + 2];
      var pIdx = i / 4;
      var px = pIdx % w;
      var py = Math.floor(pIdx / w);

      // White/light gray wool -> Glowing Cyan/Blue Holographic Data Pod!
      if (r > 175 && g > 175 && b > 175 && Math.abs(r - b) < 25) {
        var isCircuit = (px % 5 === 0) || (py % 5 === 0);
        if (isCircuit) {
          d[i] = 0; d[i + 1] = 245; d[i + 2] = 255;
        } else {
          var ratio = r / 255;
          d[i] = Math.floor(14 * ratio);
          d[i + 1] = Math.floor(165 * ratio);
          d[i + 2] = Math.floor(233 * ratio);
        }
      }
      // Brownish skin/sheared patches -> Dark Titanium Bot Chassis with Amber/Emerald circuits
      else if (r > b + 15) {
        var isBotLed = (px % 6 === 0 && py % 6 === 0);
        if (isBotLed) {
          d[i] = 16; d[i + 1] = 240; d[i + 2] = 160;
        } else {
          var blum = (r + g + b) / (3 * 255);
          d[i] = Math.floor(25 + blum * 45);
          d[i + 1] = Math.floor(35 + blum * 60);
          d[i + 2] = Math.floor(55 + blum * 85);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // Transform Steve / Alex into Cyber-Android AI Engineers (ATLAS-01 / NOVA-02)
  function transformPlayerAtlas(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.complete = true;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = imgData.data;
    var w = canvas.width;

    for (var i = 0; i < d.length; i += 4) {
      var a = d[i + 3];
      if (a < 20) continue;
      var r = d[i], g = d[i + 1], b = d[i + 2];
      var pIdx = i / 4;
      var px = pIdx % w;
      var py = Math.floor(pIdx / w);
      var lum = (r + g + b) / (3 * 255);

      // Skin / Hair (warm/brown tones where R > B + 25) -> Sleek Silver/Dark Titanium Android Helmet & Visor
      if (r > b + 25 && r > 60) {
        if (lum < 0.38) {
          // Dark Titanium Helmet shell
          d[i] = 18; d[i + 1] = 27; d[i + 2] = 46;
        } else if (py % 7 === 0) {
          // Glowing Neon Cyan Visor stripe
          d[i] = 0; d[i + 1] = 240; d[i + 2] = 255;
        } else {
          // Metallic Silver-Blue Android Faceplate
          d[i] = Math.floor(140 * lum + 40);
          d[i + 1] = Math.floor(175 * lum + 50);
          d[i + 2] = Math.floor(215 * lum + 60);
        }
      }
      // Cyan/Green shirt -> Dark Carbon Exo-Suit with Neon Emerald/Cyan Power Core lines
      else if (g > r + 15 || b > r + 15) {
        var isSeam = (px % 6 === 0) || (py % 6 === 0);
        if (isSeam && lum > 0.35) {
          d[i] = 0; d[i + 1] = 240; d[i + 2] = 255;
        } else {
          d[i] = Math.floor(15 + lum * 30);
          d[i + 1] = Math.floor(25 + lum * 55);
          d[i + 2] = Math.floor(45 + lum * 85);
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // Transform Creeper into Rogue Malware / Glitch Bot (Crimson & Dark Cyber Matrix)
  function transformCreeperAtlas(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.complete = true;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = imgData.data;
    var w = canvas.width;

    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 20) continue;
      var r = d[i], g = d[i + 1], b = d[i + 2];
      var pIdx = i / 4;
      var px = pIdx % w;
      var py = Math.floor(pIdx / w);
      var lum = (r + g + b) / (3 * 255);

      if ((px + py) % 5 === 0 && lum > 0.25) {
        // Neon crimson malware glitch lines
        d[i] = 255; d[i + 1] = 20; d[i + 2] = 75;
      } else {
        d[i] = Math.floor(35 + lum * 140);
        d[i + 1] = Math.floor(8 + lum * 15);
        d[i + 2] = Math.floor(20 + lum * 35);
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // Transform Torch & Crops into Optical Beacons & Neural Datasets
  function transformHueToTech(img, mode) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.complete = true;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var d = imgData.data;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 20) continue;
      var r = d[i], g = d[i + 1], b = d[i + 2];
      var lum = (r + g + b) / 3;
      if (mode === 'torch') {
        // Turn orange flame/wood into glowing cyan/emerald optical beacon
        d[i] = Math.floor(lum * 0.2);
        d[i + 1] = Math.min(255, Math.floor(lum * 1.15));
        d[i + 2] = Math.min(255, Math.floor(lum * 1.35 + 40));
      } else {
        // Turn crops into glowing purple/cyan neural nodes
        d[i] = Math.min(255, Math.floor(lum * 0.75 + 30));
        d[i + 1] = Math.min(255, Math.floor(lum * 0.95));
        d[i + 2] = Math.min(255, Math.floor(lum * 1.4 + 50));
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // Hook Phaser.Cache.prototype.addTextureAtlas
  function patchPhaserAtlases() {
    if (!window.Phaser || !window.Phaser.Cache || window.Phaser.Cache.prototype._playlabHooked) return;
    window.Phaser.Cache.prototype._playlabHooked = true;

    var _origAddAtlas = window.Phaser.Cache.prototype.addTextureAtlas;
    window.Phaser.Cache.prototype.addTextureAtlas = function (key, url, data, atlasData, format) {
      try {
        if (key === 'blocks') {
          data = transformBlocksAtlas(data, atlasData);
        } else if (key.indexOf('leaves') === 0) {
          data = transformLeavesAtlas(key, data);
        } else if (key === 'sheep') {
          data = transformSheepAtlas(data);
        } else if (key.indexOf('player') === 0) {
          data = transformPlayerAtlas(data);
        } else if (key === 'creeper') {
          data = transformCreeperAtlas(data);
        } else if (key === 'torch' || key === 'rails') {
          data = transformHueToTech(data, 'torch');
        } else if (key === 'crops' || key === 'miniBlocks') {
          data = transformHueToTech(data, 'crops');
        }
      } catch (err) {
        console.warn('[PlayLab AI] Texture transform error for ' + key + ':', err);
      }
      return _origAddAtlas.call(this, key, url, data, atlasData, format);
    };
  }

  // ── 5. DOM / UI ENHANCEMENTS (CLEAN THEME ATTRIBUTE & FRIENDLY AVATAR) ────
  var THEME_COLORS = {
    mc: '#10a37f',        // OpenAI Emerald
    minecraft: '#d97757', // Anthropic Terracotta
    hero: '#2563eb',      // DeepMind Blue
    aquatic: '#0284c7'    // Cloud Slate Blue
  };

  var THEME_TITLES = {
    mc: 'OpenAI Core · Data Center',
    minecraft: 'Anthropic Lab · Agentes IA',
    hero: 'DeepMind Robotics · Co-Pilot',
    aquatic: 'Centro de Datos Submarino de HiCloud, China'
  };

  var THEME_AVATARS = {
    mc: '/images/al.gif',        // Sam Altman (OpenAI Core)
    minecraft: '/images/am.gif', // Dario Amodei (Anthropic Lab)
    hero: '/images/pch.gif',     // Sundar Pichai (DeepMind Robotics)
    aquatic: '/images/lg.gif'    // Liang Wenfeng (HiCloud Submarino)
  };

  function getFriendlyAvatarSvg(gameId) {
    var color = THEME_COLORS[gameId] || '#10a37f';
    var enc = encodeURIComponent(color);
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='18' fill='" + enc + "'/><rect x='16' y='20' width='48' height='40' rx='12' fill='%23ffffff'/><circle cx='31' cy='38' r='5' fill='%2318181b'/><circle cx='49' cy='38' r='5' fill='%2318181b'/><path d='M 32 49 Q 40 55 48 49' fill='none' stroke='%2318181b' stroke-width='3.5' stroke-linecap='round'/><line x1='40' y1='10' x2='40' y2='20' stroke='%23ffffff' stroke-width='4' stroke-linecap='round'/><circle cx='40' cy='9' r='4.5' fill='%23ffffff'/></svg>";
  }

  function applyThemeAttribute() {
    var gameId = getCurrentGameId();
    if (document.documentElement.getAttribute('data-playlab-theme') !== gameId) {
      document.documentElement.setAttribute('data-playlab-theme', gameId);
    }
  }
  applyThemeAttribute();

  function enhanceDOM() {
    applyThemeAttribute();
    var gameId = getCurrentGameId();
    var lvl = getCurrentLevelNum();
    var m = MISSIONS_MC[lvl] || MISSIONS_MC[1];

    // 1. Update document title
    var newGameTitle = THEME_TITLES[gameId] || 'Play Lab — Laboratorio de IA';
    if (document.title.indexOf('Play Lab') === -1) {
      document.title = 'Play Lab — ' + newGameTitle + ' · Nivel ' + lvl;
    }

    // 1b. Update top navbar game title (replace legacy "Minecraft: ..." with AI Studio name)
    var headerTitles = document.querySelectorAll('.header_level .script_name a, .header_level .header_text, #unit_name_container a, .header_level a[href*="/units/"]');
    for (var hIdx = 0; hIdx < headerTitles.length; hIdx++) {
      if (headerTitles[hIdx].textContent !== newGameTitle) {
        headerTitles[hIdx].textContent = newGameTitle;
        headerTitles[hIdx].setAttribute('title', newGameTitle);
      }
    }

    // 2. Hide "Menos" button and enlarge animated monitor avatar (+50% to 165px)
    if (!document.getElementById('playlab-avatar-style')) {
      var customStyle = document.createElement('style');
      customStyle.id = 'playlab-avatar-style';
      customStyle.textContent = [
        '#toggleButton { display: none !important; }',
        'div[style*="padding-left: 90px"], div[style*="padding-left:90px"], div[style*="padding-left: 125px"], div[style*="padding-left:125px"] { padding-left: 185px !important; padding-right: 20px !important; min-height: 120px !important; display: flex !important; align-items: center !important; box-sizing: border-box !important; }',
        'div[style*="position: absolute"][style*="width: 90px"], div[style*="position:absolute"][style*="width:90px"], div[style*="position: absolute"][style*="width: 110px"], div[style*="position:absolute"][style*="width:110px"] { width: 165px !important; bottom: auto !important; top: 50% !important; transform: translateY(-50%) !important; }',
        '.prompt-icon-cell { width: 165px !important; max-width: 165px !important; vertical-align: middle !important; padding-right: 14px !important; }',
        '#prompt-icon, .prompt-icon { width: 165px !important; max-width: 165px !important; height: auto !important; padding-top: 4px !important; border-radius: 10px !important; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45) !important; background-color: transparent !important; }',
        '#lightbulb { top: 2px !important; right: 8px !important; }',
        '#x-close, .x-close, button[aria-label="Cerrar"], button[aria-label="Close"] { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 32px !important; height: 32px !important; min-width: 32px !important; min-height: 32px !important; border-radius: 50% !important; border: 1px solid #cbd5e1 !important; background-color: #ffffff !important; color: #475569 !important; cursor: pointer !important; padding: 0 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; position: absolute !important; top: 14px !important; right: 14px !important; inset-inline-end: 14px !important; transition: all 0.15s ease-in-out !important; z-index: 100 !important; }',
        '#x-close:hover, .x-close:hover, button[aria-label="Cerrar"]:hover, button[aria-label="Close"]:hover { background-color: #f1f5f9 !important; color: #0f172a !important; border-color: #94a3b8 !important; transform: scale(1.08) !important; }',
        '.craft-popup #x-close, [style*="rgb(37, 42, 52)"] #x-close { background-color: #334155 !important; border-color: #475569 !important; color: #f1f5f9 !important; }',
        '.craft-popup #x-close:hover, [style*="rgb(37, 42, 52)"] #x-close:hover { background-color: #475569 !important; color: #ffffff !important; }',
        '#x-close i, .x-close i, [id*="x-close"] i, [class*="x-close"] i, button[aria-label="Cerrar"] i, button[aria-label="Close"] i, .fa-xmark, .fa-times { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; font-style: normal !important; font-weight: 700 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; line-height: 1 !important; }',
        '#x-close i::before, .x-close i::before, [id*="x-close"] i::before, [class*="x-close"] i::before, button[aria-label="Cerrar"] i::before, button[aria-label="Close"] i::before, .fa-xmark::before, .fa-times::before { content: "✕" !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; font-size: 15px !important; font-weight: 700 !important; line-height: 1 !important; display: inline-block !important; color: inherit !important; }'
      ].join('\n');
      document.head.appendChild(customStyle);
    }

    var avatarGif = THEME_AVATARS[gameId] || '/images/al.gif';
    var avatars = document.querySelectorAll('img[src*="Pop_Up_Character"], img[src*="Agent_Neutral"], .prompt-icon, #prompt-icon');
    avatars.forEach(function (img) {
      if (img.tagName === 'IMG' && (!img.src || img.src.indexOf(avatarGif) === -1)) {
        img.src = avatarGif;
        img.style.width = '165px';
        img.style.maxWidth = '165px';
        img.style.height = 'auto';
        img.style.paddingTop = '4px';
        img.style.borderRadius = '10px';
        img.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.45)';
        img.style.backgroundColor = 'transparent';
      }
    });

    // 2b. Character Selection Modal labels ("Alex" -> "Abigail", "Steve" -> "Peter", subtitle update)
    var charHeaders = document.querySelectorAll('#choose-character-container .minecraft-character h1, #craft-popup-player-selection .minecraft-character h1');
    for (var cIdx = 0; cIdx < charHeaders.length; cIdx++) {
      var nameTxt = charHeaders[cIdx].textContent.trim().toLowerCase();
      if (nameTxt === 'alex') {
        charHeaders[cIdx].textContent = 'Abigail';
      } else if (nameTxt === 'steve') {
        charHeaders[cIdx].textContent = 'Peter';
      }
    }
    var charSub = document.getElementById('select-character-text');
    if (charSub && charSub.textContent.indexOf('Unidad de') !== -1) {
      charSub.textContent = 'Selecciona tu ingeniero de IA:';
    }

    // 3. Enhance Level Completion Modal (#feedback-dialog)
    var modal = document.getElementById('feedback-dialog');
    if (modal) {
      var congratsEl = modal.querySelector('p.congrats');
      if (congratsEl && (!congratsEl._playlabFixed || congratsEl.textContent.indexOf('Misión') !== -1)) {
        congratsEl._playlabFixed = true;
        congratsEl.textContent = 'Completaste el rompecabezas ' + lvl + '. ¡Felicitaciones!';
      }

      var xBtn = modal.querySelector('#x-close, .x-close');
      if (xBtn && !xBtn._playlabFixed) {
        xBtn._playlabFixed = true;
        xBtn.setAttribute('title', 'Cerrar');
        xBtn.setAttribute('aria-label', 'Cerrar');
        xBtn.addEventListener('click', function () {
          try {
            var m = $(modal).data('modal');
            if (m && typeof m.hide === 'function') m.hide();
          } catch (e) {}
          modal.style.display = 'none';
          var backdrop = document.querySelector('.modal-backdrop');
          if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        });
      }

      var againBtn = modal.querySelector('#again-button');
      if (againBtn && !againBtn._playlabFixed) {
        againBtn._playlabFixed = true;
        if (!againBtn.textContent.trim()) {
          againBtn.textContent = 'Repetir';
        }
        againBtn.addEventListener('click', function () {
          try {
            var m = $(modal).data('modal');
            if (m && typeof m.hide === 'function') m.hide();
          } catch (e) {}
          modal.style.display = 'none';
          var backdrop = document.querySelector('.modal-backdrop');
          if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        });
      }

      var continueBtn = modal.querySelector('#continue-button');
      if (continueBtn && !continueBtn._playlabFixed) {
        continueBtn._playlabFixed = true;
        if (!continueBtn.textContent.trim()) {
          continueBtn.textContent = 'Continuar';
        }
        var nextUrl = '/play/' + gameId + '/' + (lvl + 1);
        continueBtn.addEventListener('click', function () {
          setTimeout(function () {
            window.location.href = nextUrl;
          }, 80);
        });
      }
    }

    // Remove old telemetry bar if present
    var oldBar = document.getElementById('playlab-telemetry-bar');
    if (oldBar && oldBar.parentNode) {
      oldBar.parentNode.removeChild(oldBar);
    }
  }

  // Expose lifecycle hooks (Note: #visualization world textures left untouched per user request)
  window.PlayLabAI = {
    beforeCraftInit: function () {
      applyThemeAttribute();
      patchLocales();
      if (window.appOptions) {
        patchLevelOptions(window.appOptions);
      }
    },
    enhanceDOM: enhanceDOM
  };

  document.addEventListener('DOMContentLoaded', function () {
    applyThemeAttribute();
    patchLocales();
    enhanceDOM();
    setInterval(enhanceDOM, 600);
  });
})();
