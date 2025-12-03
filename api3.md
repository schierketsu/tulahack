Руководство по переходу на JS API v3
Руководство содержит примеры, демонстрирующие различия между JavaScript API версий v3 и 2.1. Так как API отличны в корне, в этом разделе освещены лишь различия в базовых компонентах и подходах.

Подключение API
Версия 2.1
<!DOCTYPE html>
  <head>
    <!-- Загружаем API -->
    <script src="https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU"></script>
    <script>
      // При успешной загрузке API выполняется
      // соответствующая функция.
      ymaps.ready(function () {
         …
      });
    </script>
  </head>
  ...
</html>

Версия v3
<!DOCTYPE html>
<html>
  <head>
    <!-- Загружаем API -->
    <script src="https://api-maps.yandex.ru/v3/?apikey=YOUR_API_KEY&lang=ru_RU"></script>
    <script>
      // При успешной загрузке API доступен промис `ymaps3.ready`
      ymaps3.ready.then(() => {
         …
      });
    </script>
  </head>
  ...
</html>

Обязательные параметры:

apikey — API-ключ. Как получить ключ;
lang — язык.
Важно

В API v3 раздельная подзагрузка модулей по требованию отсутствует. Нет параметра onload. Единственный способ выполнить код после готовности API — это промис ymaps3.ready.

Создание карты
Версия 2.1
// Создание экземпляра карты
// и его привязка к
// контейнеру с id="YMapsID".
const map = new ymaps.Map('YMapsID', {
  center: [37.588144, 55.733842],
  zoom: 10,
  type: 'yandex#satellite',
  // Карта будет создана без
  // элементов управления.
  controls: []
});

Версия v3
// Создание экземпляра карты.
const map = new ymaps3.YMap(document.getElementById('YMapsID'), {
  location: {
    center: [37.588144, 55.733842],
    zoom: 10
  }
});

Примечание

В API v3 нет слоя со спутниковыми данными. Если вам необходим такой слой, то вы можете создать его сами, указав url для получения тайлов.

Поведения
Версия 2.1
По умолчанию включены следующие поведения: drag, multiTouch, dblClickZoom, rightMouseButtonMagnifier, scrollZoom.

Версия v3
Полный список поведений приведен в разделе YMapListener.

По умолчанию включены следующие поведения: drag, scrollZoom, pinchZoom, dblClick, magnifier.

Геообъекты
Задание стиля метки
Версия 2.1
// Метка с одним из стандартных значков.
// Список стандартных стилей приведен
// в справочнике в разделе
// option.preset.storage.
var placemark = new ymaps.Placemark(
  [37.6, 55.8],
  {},
  {
    preset: 'islands#greenCircleIcon'
  }
);

// Создание метки с собственным значком.
var placemark2 = new ymaps.Placemark(
  [37.6, 55.8],
  {},
  {
    // Один из двух стандартных макетов
    // меток со значком-картинкой:
    // - default#image - без содержимого;
    // - default#imageWithContent - с текстовым
    // содержимым в значке.
    iconLayout: 'default#image',
    iconImageHref: '/path/to/icon.png',
    iconImageSize: [20, 30],
    iconImageOffset: [-10, -20]
  }
);

Версия v3
import {YMapDefaultMarker} from '@yandex/ymaps3-default-ui-theme';

const defaultMarker = new YMapDefaultMarker({
  title: 'Привет мир!',
  subtitle: 'Добрый и светлый'
});

const content = document.createElement('div');
const marker = new ymaps3.YMapMarker(content);
content.innerHTML = '<div>Тут может быть все что угодно</div>';

const map = new ymaps3.YMap(document.getElementById('map-root'), {
  location: INITIAL_LOCATION
})
  .addChild(new ymaps3.YMapDefaultSchemeLayer())
  .addChild(new ymaps3.YMapDefaultFeaturesLayer({zIndex: 1800}))
  .addChild(defaultMarker)
  .addChild(marker);

В API v3 есть лишь один дефолтный тип маркеров: YMapDefaultMarker, который находится во внешнем npm пакете @yandex/ymaps3-default-ui-theme.

Для кастомных маркеров используйте YMapMarker. Он позволяет использовать любые HTML внутри.

Кластеризация
Версия v3
В API v3 отсутствует встроенный механизм кластеризации.

Для работы с кластеризацией маркеров используйте класс YMapClusterer из пакета @yandex/ymaps3-clusterer, который добавляет расширенные возможности в JS API. Порядок подключения описан в инструкции.

Элементы управления картой
Версия v3
По умолчанию карта создается без стандартных элементов управления: полноэкранный режим, кнопки масштаба, геолокация. О том, как добавить на карту необходимые элементы управления, см. в разделе Элементы управления.

В API v3 остались только три элемента управления: геолокация, кнопки масштаба и обычная кнопка. Подробнее

Попап
Версия v3
В API v3 нет встроенного всплывающего окна. Вместо этого вы можете самостоятельно управлять содержимым HTML-элемента маркера.


Справочник JS API
Справочник содержит описание программного интерфейса JavaScript API версии v3.

Целевой аудиторией справочника являются разработчики сайтов, которые хотят использовать интерактивные Яндекс.Карты на своих веб-страницах.

Справочник содержит описания открытых классов и методов API и рассчитан на разработчиков, знакомых с JavaScript и сервисом Яндекс.Карты. Классы перечислены в алфавитном порядке.

Class: Config
Configuration object for whole API.
For example, it can be used to set experiments or apikeys.

ymaps3.getDefaultConfig().setApikeys({search: "YOUR_SEARCH_API_KEY"})`.
Constructors
constructor
new Config()

Properties
description
readonly description: string
Methods
setApikeys
setApikeys(apikeys): void

Set apikeys for http-services.

ymaps3.getDefaultConfig().setApikeys({search: "YOUR_SEARCH_API_KEY"})`.
Parameters
Name	Type
apikeys	Apikeys
Returns
void

setExperiments
setExperiments(experiments): void

Set experiments for map.

Parameters
Name	Type
experiments	Record<string, boolean>
Returns
void

Class: YMap
Main API class. Create a map container.

Example

const map = new YMap(
    document.getElementById('map-root'),
    {location: {center: [-0.118092, 51.509865], zoom: 10}}
);
// add default Yandex scheme layer
map.addChild(new YMapDefaultSchemeLayer());
// relocate map to another point with animation in 200 milliseconds
map.setLocation({center: [48.707067, 44.516975], duration: 200});
// change mode from default `auto` to `raster`
map.setMode('raster');
// get map zoom for some calculations
const zoom = map.zoom;
Constructors
constructor
new YMap(rootContainer, props, children?)

Parameters
Name	Type
rootContainer	HTMLElement
props	YMapProps
children?	YMapEntity<unknown, {}>[]
Overrides
GenericRootEntity.constructor

Properties
children
readonly children: YMapEntity<unknown, {}>[]
Overrides
GenericRootEntity.children

[overrideKeyReactify]
static [overrideKeyReactify]: CustomReactify<YMap, ForwardRefExoticComponent<{
	behaviors?: BehaviorType[];
	camera?: YMapCameraRequest;
	children?: ReactNode;
	className?: string;
	config?: Config;
	copyrights?: boolean;
	copyrightsPosition?: YMapCopyrightsPosition;
	hotspotsStrategy?: "forViewport" | "forPointerPosition";
	key?: null | Key;
	location: YMapLocationRequest;
	margin?: Margin;
	mode?: MapMode;
	projection?: Projection;
	ref?: Ref<YMap>;
	restrictMapArea?: false | LngLatBounds;
	showScaleInCopyrights?: boolean;
	theme?: YMapTheme;
	tiltRange?: TiltRange;
	worldOptions?: WorldOptions;
	zoomRange?: ZoomRange;
	zoomRounding?: ZoomRounding;
	zoomStrategy?: ZoomStrategy 
}>>
defaultProps
static defaultProps: Readonly<{
	behaviors: string[];
	camera: {
		azimuth: number;
		tilt: number 
	};
	className: "";
	config: Config;
	copyrights: true;
	copyrightsPosition: "bottom right";
	hotspotsStrategy: "forViewport" | "forPointerPosition";
	margin: undefined | Margin;
	mode: "auto";
	projection: Projection;
	restrictMapArea: false;
	showScaleInCopyrights: false;
	theme: "light";
	worldOptions: {
		cycledX: boolean;
		cycledY: boolean 
	};
	zoomRange: ZoomRange;
	zoomRounding: "auto";
	zoomStrategy: "zoomToPointer" 
}>
Accessors
azimuth
get azimuth(): number

Returns
number

behaviors
get behaviors(): readonly BehaviorType[]

getter for YMapProps.behaviors prop

Returns
readonly BehaviorType[]

bounds
get bounds(): LngLatBounds

getter for YMapProps.location.bounds prop

Returns
LngLatBounds

center
get center(): readonly [number, number, undefined | number]

getter for YMapProps.location.center prop

Returns
readonly [number, number, undefined | number]

config
get config(): Readonly<Config>

getter for YMapProps.config prop

Returns
Readonly<Config>

container
get container(): HTMLElement

Main map container

Returns
HTMLElement

parent
get parent(): null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Get parent entity.

Returns
null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Inherited from
GenericRootEntity.parent

projection
get projection(): Projection

getter for YMapProps.projection prop

Returns
Projection

restrictMapArea
get restrictMapArea(): Readonly<false | LngLatBounds>

getter for YMapProps.restrictMapArea prop

Returns
Readonly<false | LngLatBounds>

root
get root(): this

Get root entity.

Returns
this

Inherited from
GenericRootEntity.root

size
get size(): PixelCoordinates

getter for map size

Returns
PixelCoordinates

theme
get theme(): "dark" | "light"

getter for YMapProps.theme prop

Returns
"dark" | "light"

tilt
get tilt(): number

Returns
number

tiltRange
get tiltRange(): Readonly<TiltRange>

Returns
Readonly<TiltRange>

zoom
get zoom(): number

getter for YMapProps.location.zoom prop

Returns
number

zoomRange
get zoomRange(): Readonly<ZoomRange>

getter for YMapProps.zoomRange prop

Returns
Readonly<ZoomRange>

Methods
addChild
addChild(child, index?): YMap

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMap

Overrides
GenericRootEntity.addChild

destroy
destroy(): void

Destroy map and remove it from user DOM-element

Returns
void

Overrides
GenericRootEntity.destroy

removeChild
removeChild(child): YMap

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMap

Overrides
GenericRootEntity.removeChild

setBehaviors
setBehaviors(behaviors): void

setter for YMapProps.behaviors prop

Parameters
Name	Type
behaviors	BehaviorType[]
Returns
void

setCamera
setCamera(camera): void

setter for YMapProps.camera prop

Parameters
Name	Type
camera	YMapCameraRequest
Returns
void

setConfig
setConfig(config): void

setter for YMapProps.config prop

Parameters
Name	Type
config	Config
Returns
void

setLocation
setLocation(location): void

setter for YMapProps.location prop

Parameters
Name	Type
location	YMapLocationRequest
Returns
void

setMargin
setMargin(margin): void

setter for YMapProps.margin prop

Parameters
Name	Type
margin	Margin
Returns
void

setMode
setMode(mode): void

setter for YMapProps.mode prop

Parameters
Name	Type
mode	MapMode
Returns
void

setProjection
setProjection(projection): void

setter for YMapProps.projection prop

Parameters
Name	Type
projection	Projection
Returns
void

setRestrictMapArea
setRestrictMapArea(restrictMapArea): void

setter for YMapProps.config prop

Parameters
Name	Type
restrictMapArea	LngLatBounds
Returns
void

setZoomRange
setZoomRange(zoomRange): void

setter for YMapProps.zoomRange prop

Parameters
Name	Type
zoomRange	ZoomRange
Returns
void

setZoomRounding
setZoomRounding(zoomRounding): void

setter for YMapProps.zoomRounding prop

Parameters
Name	Type
zoomRounding	ZoomRounding
Returns
void

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapProps>	New props values.
Returns
void

Inherited from
GenericRootEntity.update

Class: YMapCollection
YMapCollection is a collection of YMapEntity objects.
Allow adding or removing YMapEntity objects.

const collection = new YMapCollection({});
const markerElement = document.createElement('div');
markerElement.className = 'marker';

for (let i = 0; i < 10_000; i++) {
 collection.addChild(new YMapMarker({
   coordinates: [Math.random() * 180, Math.random() * 180]
 }, markerElement.cloneNode(true)));
}

map.addChild(collection); // Add collection to the map
map.removeChild(collection); // Remove all markers from the map
Constructors
constructor
new YMapCollection(props, options?)

Parameters
Name	Type	Description
props	Object	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapGroupEntity.constructor

new YMapCollection(props, children?, options?)

Parameters
Name	Type
props	Object
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
addChild
addChild(child, index?): YMapCollection

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapCollection

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapCollection

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapCollection

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<{}>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapComplexEntity<Props, DefaultProps>
Entity that aggregates multiple Entities but looks basic from the outside.

Type Param

Root Entity Class.

Example

type YMapSomeComplexEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeComplexEntity extends YMapComplexEntity<YMapSomeComplexEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 private _someEntity?: YMapSomeEntity; // YMapSomeEntity extends GenericEntity
 protected _onAttach(): void {
     this._someEntity = new YMapSomeEntity();
     this.addChild(this._someEntity); // add someEntity as children
     // ...
 }
 // ...
}
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Implements
YMapEntity<Props, DefaultProps>
Implemented by
YMapGroupEntity
Constructors
constructor
new YMapComplexEntity<Props, DefaultProps>(props, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type	Description
props	Props	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
GenericComplexEntity.constructor

new YMapComplexEntity<Props, DefaultProps>(props, children?, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type
props	Props
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
GenericComplexEntity.constructor

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Implementation of
YMapEntity.parent

Overrides
GenericComplexEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Implementation of
YMapEntity.root

Overrides
GenericComplexEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Implementation of
YMapEntity.update

Inherited from
GenericComplexEntity.update

Class: YMapContainer
Allow adding or removing YMapEntity objects or usual DOM elements inside the YMap.

const container = <YMapContainer>
    <YMapMarker coordinates={[55.76, 37.64]}><div className="point"></div></YMapMarker>
    <div>Some text</div>
</YMapContainer>;

ReactDOM.render(<YMap>{container}</YMap, document.getElementById('root'));
In this example, the container variable contains a YMapContainer object with two children: YMapMarker and div.

YMapMarker is a YMapEntity
div is a usual DOM element
Constructors
constructor
new YMapContainer(props, options?)

Parameters
Name	Type	Description
props	ComputedYMapContainerProps<unknown>	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapGroupEntity.constructor

new YMapContainer(props, children?, options?)

Parameters
Name	Type
props	ComputedYMapContainerProps<unknown>
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

element
optional element: Element
[overrideKeyReactify]
static [overrideKeyReactify]: CustomReactify<YMapReactContainer, FC<YMapReactContainerProps<unknown> & {
	children?: ReactNode 
}>>
defaultProps
static defaultProps: Object
Type declaration
Name	Type
tagName	string
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
addChild
addChild(child, index?): YMapContainer

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapContainer

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapContainer

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapContainer

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<ComputedYMapContainerProps<unknown>>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapContext<T>
Context for YMap. It allows you to provide a value to the context and use it in the children of the context provider.

const YMapSomeContext = new ymaps3.YMapContext('YMapSomeContext');
class SomeValueProvider extends ymaps3.YMapGroupEntity<{}> {
 constructor() {
    super({});
    this._provideContext(YMapSomeContext, {your: 'value'}); // Special method to provide context value
 }
}
And some child entity can use this context:

class SomeContextConsumer extends ymaps3.YMapEntity<{}> {
   constructor() {
       super({});
   }

   _onAttach() {
     const value = this._consumeContext(YMapSomeContext); // Special method to get context value
     console.log(value); // {your: 'value'}
   }
}
In any level of nesting:

<SomeValueProvider>
    <YMapContainer>
         <YMapContainer>
             <SomeContextConsumer />
         </YMapContainer>
    </YMapContainer>
</SomeEntity>
You can set the context value using YMapContextProvider:

<YMapContextProvider context={YMapSomeContext} value={{your: 'value'}}>
    <YMapContainer>
         <YMapContainer>
             <SomeContextConsumer />
         </YMapContainer>
    </YMapContainer>
</SomeEntity>
Type parameters
Name
T
Constructors
constructor
new YMapContext<T>(name)

Type parameters
Name
T
Parameters
Name	Type
name	string
Inherited from
Context.constructor

Properties
name
readonly name: string
Inherited from
Context.name

Class: YMapContextProvider<T>
Context provider for YMap, allowing to inject a context and its value.

const mapContextProvider = new YMapContextProvider({context: SomeMapContext, value: {your: 'value'}});
map.addChild(mapContextProvider);
And define context consumer:

class SomeContextConsumer extends ymaps3.YMapEntity<{}> {
   constructor() {
       super({});
   }

   _onAttach() {
     const value = this._consumeContext(SomeMapContext);
     console.log(value); // {your: 'value'}
   }
}
When adding nested containers, the context will be available in them:

mapContextProvider.addChild(new SomeContextConsumer());
But the most important thing is that the context can be passed at any nesting level:

<YMapContextProvider context={SomeMapContext} value={{your: 'value'}}>
    <YMapContainer>
        <YMapContainer>
            <SomeContextConsumer />
        <YMapContainer>
    </YMapContainer>
</YMapContextProvider>
Type parameters
Name
T
Constructors
constructor
new YMapContextProvider<T>(props, options?)

Type parameters
Name
T
Parameters
Name	Type	Description
props	YMapContextProviderProps<T>	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapGroupEntity.constructor

new YMapContextProvider<T>(props, children?, options?)

Type parameters
Name
T
Parameters
Name	Type
props	YMapContextProviderProps<T>
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
addChild
addChild(child, index?): YMapContextProvider<T>

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapContextProvider<T>

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapContextProvider<T>

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapContextProvider<T>

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapContextProviderProps<T>>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapControl
Entity that aggregates multiple Entities, and allows you to publicly add and remove entities to a subtree.

Type Param

Root Entity Class.

Example

type YMapSomeGroupEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeGroupEntity extends YMapGroupEntity<YMapSomeGroupEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 // ...
}
const groupEntity = new YMapSomeGroupEntity()
const someEntity = new YMapSomeEntity(); // YMapSomeEntity extends GenericEntity
groupEntity.addChild(someEntity); // add someEntity in YMapSomeGroupEntity object
groupEntity.removeChild(someEntity); // remove someEntity from YMapSomeGroupEntity object
Constructors
constructor
new YMapControl(props?, element?)

Parameters
Name	Type
props?	YMapControlProps
element?	HTMLElement
Overrides
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

[overrideKeyReactify]
static [overrideKeyReactify]: CustomReactify<YMapControl, ForwardRefExoticComponent<{
	children?: ReactNode;
	key?: null | Key;
	ref?: Ref<GenericEntity<YMapControlProps & {
	controlElement: HTMLElement 
}, {}, GenericRootEntity<unknown, {}>>>;
	transparent?: boolean 
}>>
defaultProps
static defaultProps: Readonly<{
	transparent: false 
}>
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
addChild
addChild(child, index?): YMapControl

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapControl

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapControl

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapControl

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapControlProps>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapControlButton
The control element - button.

const map = new YMap(document.getElementById('map-root'), {...});
const controls = new YMapControls({position: 'top left horizontal'});
let count = 0;
const button = new YMapControlButton({
    text: 'Click me!',
    onClick: () => {
        button.update({text: 'Clicked:' + ++count});
    }
});
controls.addChild(button);
map.addChild(controls);
See

https://yandex.ru/dev/jsapi30/doc/en/dg/concepts/controls/

Constructors
constructor
new YMapControlButton(props, options?)

Parameters
Name	Type	Description
props	YMapControlCommonButtonProps	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapComplexEntity.constructor

new YMapControlButton(props, children?, options?)

Parameters
Name	Type
props	YMapControlCommonButtonProps
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapComplexEntity.constructor

Properties
[overrideKeyReactify]
static [overrideKeyReactify]: CustomReactify<YMapControlButton, ForwardRefExoticComponent<{
	background?: string;
	children?: ReactNode;
	color?: string;
	disabled?: boolean;
	element?: HTMLElement;
	key?: null | Key;
	onClick?: () => void;
	ref?: Ref<GenericEntity<YMapControlCommonButtonProps, {}, GenericRootEntity<unknown, {}>>>;
	text?: string 
}>>
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapComplexEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapComplexEntity.root

text
get text(): undefined | string

Returns
undefined | string

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapControlCommonButtonProps>	New props values.
Returns
void

Inherited from
YMapComplexEntity.update

Class: YMapControlCommonButton
Default control button. Can be used as a base for custom controls.

const map = new ymaps3.YMap(document.getElementById('map-root'), {...});
const controls = new ymaps3.YMapControls({position: 'bottom right'});
const button = new ymaps3.YMapControlCommonButton({
   text: 'Click me!',
   onClick: () => {
     console.log('Button clicked');
   }
});
controls.addChild(button);
More about controls: Yandex Maps API controls

Constructors
constructor
new YMapControlCommonButton(props, options?)

Parameters
Name	Type	Description
props	YMapControlCommonButtonProps	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapGroupEntity.constructor

new YMapControlCommonButton(props, children?, options?)

Parameters
Name	Type
props	YMapControlCommonButtonProps
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
addChild
addChild(child, index?): YMapControlCommonButton

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapControlCommonButton

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapControlCommonButton

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapControlCommonButton

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapControlCommonButtonProps>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapControls
DOM container for grouping a number of controls to group and position them

Example

const map = new YMap(document.getElementById('map-root'), {
    location: [37.622504, 55.753215],
    mode: 'raster'
});
const controls = new YMapControls({position: 'top left horizontal'});
const button = text => new YMapControlButton({
    text: 'Click me',
    onClick: () => {
        alert('Click');
    }
});
map.addChild(controls);
Constructors
constructor
new YMapControls(props, children?)

Parameters
Name	Type
props	YMapControlsProps
children?	YMapEntity<unknown, {}>[]
Overrides
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
addChild
addChild(child, index?): YMapControls

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapControls

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapControls

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapControls

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapControlsProps>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapDefaultFeaturesLayer
Map defaults layer to show features on map.

Example

const defaultFeaturesLayer = new YMapDefaultFeaturesLayer();
// add to map
map.addChild(defaultFeaturesLayer);
// update
defaultFeaturesLayer.update({zIndex: 1501});
Constructors
constructor
new YMapDefaultFeaturesLayer(props, options?)

Parameters
Name	Type	Description
props	YMapDefaultFeaturesLayerProps	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapComplexEntity.constructor

new YMapDefaultFeaturesLayer(props, children?, options?)

Parameters
Name	Type
props	YMapDefaultFeaturesLayerProps
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapComplexEntity.constructor

Properties
defaultProps
static defaultProps: Readonly<{
	source: "ymaps3x0-default-feature";
	visible: true 
}>
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapComplexEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapComplexEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapDefaultFeaturesLayerProps>	New props values.
Returns
void

Inherited from
YMapComplexEntity.update

Class: YMapDefaultSchemeLayer
Map default layer to show yandex scheme on map.

Example

const defaultSchemeLayer = new YMapDefaultSchemeLayer({theme: 'dark'});
// add to map
map.addChild(defaultSchemeLayer);
// update
defaultSchemeLayer.update({theme: 'light'});
Constructors
constructor
new YMapDefaultSchemeLayer(props, options?)

Parameters
Name	Type	Description
props	YMapDefaultSchemeLayerProps	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
YMapComplexEntity.constructor

new YMapDefaultSchemeLayer(props, children?, options?)

Parameters
Name	Type
props	YMapDefaultSchemeLayerProps
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
YMapComplexEntity.constructor

Properties
defaultProps
static defaultProps: Object
Type declaration
Name	Type	Description
clampMapZoom	boolean	-
layers	{ buildings: { zIndex: number } ; ground: { zIndex: number } ; icons: { zIndex: number } ; labels: { zIndex: number } }	-
layers.buildings	{ zIndex: number }	-
layers.buildings.zIndex	number	-
layers.ground	{ zIndex: number }	-
layers.ground.zIndex	number	-
layers.icons	{ zIndex: number }	-
layers.icons.zIndex	number	-
layers.labels	{ zIndex: number }	-
layers.labels.zIndex	number	-
layersInfo	Record<YMapDefaultSchemeLayerType, { type: string ; zIndex: number }>	Deprecated use DefaultProps.layers instead
source	string	-
visible	boolean	-
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapComplexEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapComplexEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapDefaultSchemeLayerProps>	New props values.
Returns
void

Inherited from
YMapComplexEntity.update

Class: YMapEntity<Props, DefaultProps>
Entity Base Class. It has event handlers for attaching, detaching and updating props. Has a method for providing and using context.

Example

type YMapSomeEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeEntity extends YMapEntity<YMapSomeEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 public isAttached: boolean;
 constructor(props: YMapSomeEntityProps) {
     super(props);
     this.isAttached = false
     // Additional actions can be taken in the constructor of a class.
 }
 protected _onAttach(): void {
     this.isAttached = true;
     // Additional actions can be taken when an Entity is attached.
 }
 // ...
}
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Implemented by
YMapComplexEntity
Constructors
constructor
new YMapEntity<Props, DefaultProps>(props)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type	Description
props	Props	The value of input props.
Inherited from
GenericEntity.constructor

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Overrides
GenericEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Overrides
GenericEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Inherited from
GenericEntity.update

Class: YMapFeature
Component for creating a geo object on the map.
Supports drag-and-drop functionality, drawing styles, and event handling.
Supported geometries: Point, LineString, MultiLineString, Polygon and MultiPolygon.

const feature = new YMapFeature({
    geometry: {
        type: 'LineString',
        coordinates: [
            [37.40108963847453, 55.70173382087952],
            [37.60954231796791, 55.57717912610197]
        ]
    },
    style: {
        stroke: [{width: 12, color: 'rgb(14, 194, 219)'}]
    }})
map
    .addChild(new YMapDefaultSchemeLayer())
    .addChild(new YMapDefaultFeaturesLayer())
    .addChild(feature);
You can add Point geometry with HTMLElement:

const feature = new YMapFeature({
   geometry: {
     type: 'Point',
     coordinates: [37.40108963847453, 55.70173382087952]
   },
   style: {
     element: document.createElement('div')
   }
});
But better to use YMapMarker for this.

Constructors
constructor
new YMapFeature(props)

Parameters
Name	Type
props	YMapFeatureProps
Overrides
YMapEntity.constructor

Properties
defaultProps
static defaultProps: Readonly<{
	source: "ymaps3x0-default-feature" 
}>
Accessors
geometry
get geometry(): GenericGeometry<LngLat>

Returns
GenericGeometry<LngLat>

id
get id(): string

Returns
string

parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapEntity.parent

properties
get properties(): undefined | Record<string, unknown>

Returns
undefined | Record<string, unknown>

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapFeatureProps>	New props values.
Returns
void

Inherited from
YMapEntity.update

Class: YMapFeatureDataSource
Map geojson data source. Used to upload objects to the map in geojson format

Example

const ID = 'id';
const dataSource = new YMapFeatureDataSource({id: ID});
const layer = new YMapLayer({source: ID, type: 'features', zIndex: 10});
map
    .addChild(dataSource)
    .addChild(layer);
Constructors
constructor
new YMapFeatureDataSource(props)

Parameters
Name	Type	Description
props	YMapFeatureDataSourceProps	The value of input props.
Inherited from
YMapEntity.constructor

Properties
defaultProps
static defaultProps: Readonly<{
	dynamic: true 
}>
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapFeatureDataSourceProps>	New props values.
Returns
void

Inherited from
YMapEntity.update

Class: YMapGroupEntity<Props, DefaultProps>
Entity that aggregates multiple Entities, and allows you to publicly add and remove entities to a subtree.

Type Param

Root Entity Class.

Example

type YMapSomeGroupEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeGroupEntity extends YMapGroupEntity<YMapSomeGroupEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 // ...
}
const groupEntity = new YMapSomeGroupEntity()
const someEntity = new YMapSomeEntity(); // YMapSomeEntity extends GenericEntity
groupEntity.addChild(someEntity); // add someEntity in YMapSomeGroupEntity object
groupEntity.removeChild(someEntity); // remove someEntity from YMapSomeGroupEntity object
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Implements
YMapComplexEntity<Props, DefaultProps>
Constructors
constructor
new YMapGroupEntity<Props, DefaultProps>(props, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type	Description
props	Props	The value of input props.
options?	ComplexOptions<YMap>	Optional options object.
Inherited from
GenericGroupEntity.constructor

new YMapGroupEntity<Props, DefaultProps>(props, children?, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type
props	Props
children?	GenericEntity<unknown, {}, YMap>[]
options?	Omit<ComplexOptions<YMap>, "children">
Inherited from
GenericGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Implementation of
YMapComplexEntity.children

Overrides
GenericGroupEntity.children

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Implementation of
YMapComplexEntity.parent

Overrides
GenericGroupEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Implementation of
YMapComplexEntity.root

Overrides
GenericGroupEntity.root

Methods
addChild
addChild(child, index?): YMapGroupEntity<Props, DefaultProps>

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapGroupEntity<Props, DefaultProps>

Implementation of
YMapComplexEntity.addChild

Overrides
GenericGroupEntity.addChild

removeChild
removeChild(child): YMapGroupEntity<Props, DefaultProps>

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapGroupEntity<Props, DefaultProps>

Implementation of
YMapComplexEntity.removeChild

Overrides
GenericGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Implementation of
YMapComplexEntity.update

Inherited from
GenericGroupEntity.update

Class: YMapHotspot
Some active area on the map that can be clicked.
This is not a real YMapEntity, it cannot be added to the map.
But you can check it by instance of in YMapListener handlers
For example, in custom layers you can pass an object of this type in the findObjectInPosition method
Or just listen to the onEventName event and check the object:

const map = new ymaps3.YMap(document.getElementById('map-root'), {...});
map.addChild(new ymaps3.YMapListener({
  layer: 'any',
  onClick: (object) => {
     if (object instanceof ymaps3.YMapHotspot) {
         console.log('Hotspot clicked', object);
     }
  }
}))
Constructors
constructor
new YMapHotspot(geometry, properties)

Parameters
Name	Type
geometry	undefined | GenericGeometry<LngLat>
properties	Record<string, unknown>
Properties
geometry
optional readonly geometry: GenericGeometry<LngLat>
id
readonly id: string
properties
readonly properties: Record<string, unknown>
Class: YMapLayer
Map layer.

Constructors
constructor
new YMapLayer(props)

Parameters
Name	Type	Description
props	YMapLayerProps	The value of input props.
Inherited from
YMapEntity.constructor

Properties
defaultProps
static defaultProps: Readonly<{
	zIndex: 1500 
}>
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapLayerProps>	New props values.
Returns
void

Inherited from
YMapEntity.update

Class: YMapListener
A component for handling events of the map and its child elements. DOM events are also hung through this component.

Example

const clickCallback = () => alert("Clicked!");

const mapListener = new YMapListener({
    layerId: "any",
    onClick: clickCallback,
});

map.addChild(mapListener);
See

More about events

Constructors
constructor
new YMapListener(props)

Parameters
Name	Type	Description
props	YMapListenerProps	The value of input props.
Inherited from
YMapEntity.constructor

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapListenerProps>	New props values.
Returns
void

Inherited from
YMapEntity.update

Class: YMapMarker
The marker component on the map. Allows you to insert your own DOM implementation of the marker.

Does not provide a default implementation. See YMapDefaultMarker from @yandex/ymaps3-default-ui-theme

Example

const content = document.createElement('div');
content.innerHTML = '<p>Draggable paragraph</p>';
map.addChild(new YMapDefaultFeaturesLayer({zIndex: 1800}))
map.addChild(new YMapMarker({
    coordinates: [37, 55],
    draggable: true
}, content));
Note: to insert a marker on the map, you need a YMapLayer layer with type 'markers'.
The example above uses YMapDefaultFeaturesLayer, which automatically adds the layer and the required datasource.

Constructors
constructor
new YMapMarker(props, element?)

Parameters
Name	Type
props	YMapMarkerProps
element?	HTMLElement
Overrides
YMapGroupEntity.constructor

Properties
children
readonly children: readonly YMapEntity<unknown, {}>[]
Inherited from
YMapGroupEntity.children

element
readonly element: HTMLElement
[overrideKeyReactify]
static [overrideKeyReactify]: CustomReactify<YMapMarker, ForwardRefExoticComponent<{
	blockBehaviors?: boolean;
	blockEvents?: boolean;
	children?: ReactNode;
	coordinates: LngLat;
	disableRoundCoordinates?: boolean;
	draggable?: boolean;
	hideOutsideViewport?: HideOutsideRule;
	id?: string;
	key?: null | Key;
	mapFollowsOnDrag?: boolean | {
	activeZoneMargin?: Margin 
};
	markerElement?: HTMLElement;
	onClick?: (`event`: MouseEvent, `mapEvent`: MapEvent) => void;
	onDoubleClick?: (`event`: MouseEvent, `mapEvent`: MapEvent) => void;
	onDragEnd?: YMapMarkerEventHandler;
	onDragMove?: YMapMarkerEventHandler;
	onDragStart?: YMapMarkerEventHandler;
	onFastClick?: (`event`: MouseEvent, `mapEvent`: MapEvent) => void;
	onMouseEnter?: (`event`: MouseEvent, `mapEvent`: MapEvent) => void;
	onMouseLeave?: (`event`: MouseEvent, `mapEvent`: MapEvent) => void;
	properties?: Record<string, unknown>;
	ref?: Ref<GenericEntity<{
	coordinates: LngLat;
	disableRoundCoordinates?: boolean;
	hideOutsideViewport?: HideOutsideRule;
	id?: string;
	properties?: Record<string, unknown>;
	source?: string;
	zIndex?: number 
} & DraggableProps<YMapMarkerEventHandler> & BlockingProps & FeatureClickEvents & FeatureMouseEvents & {
	markerElement?: HTMLElement 
}, {}, GenericRootEntity<unknown, {}>>>;
	source?: string;
	zIndex?: number 
}>>
defaultProps
static defaultProps: Readonly<{
	blockBehaviors: false;
	blockEvents: false;
	draggable: false;
	hideOutsideViewport: false;
	mapFollowsOnDrag: false;
	source: "ymaps3x0-default-feature";
	zIndex: 0 
}>
Accessors
coordinates
get coordinates(): LngLat

Returns
LngLat

parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapGroupEntity.parent

properties
get properties(): undefined | Record<string, unknown>

Returns
undefined | Record<string, unknown>

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapGroupEntity.root

Methods
_onAttach
_onAttach(): void

Returns
void

Overrides
YMapGroupEntity._onAttach

_onDetach
_onDetach(): void

Returns
void

Overrides
YMapGroupEntity._onDetach

addChild
addChild(child, index?): YMapMarker

Parameters
Name	Type
child	YMapEntity<unknown, {}>
index?	number
Returns
YMapMarker

Inherited from
YMapGroupEntity.addChild

removeChild
removeChild(child): YMapMarker

Parameters
Name	Type
child	YMapEntity<unknown, {}>
Returns
YMapMarker

Inherited from
YMapGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapMarkerProps>	New props values.
Returns
void

Inherited from
YMapGroupEntity.update

Class: YMapScaleControl
A control that shows the map scale in different units of measurement.

Example

Add scale control to the lower left part of the map:

const scaleControl = new YMapScaleControl({});
const controls = new YMapControls({position: 'bottom left'}, [scaleControl]);
map.addChild(controls)
Alternatively, you can show the integrated scale control on the map by showScaleInCopyrights props:

const map = new YMap(document.getElementById('map-root'), {
  showScaleInCopyrights: true,
  location: {center: [37.622504, 55.753215], zoom: 10}
});
Constructors
constructor
new YMapScaleControl(props)

Parameters
Name	Type
props	YMapScaleControlProps
Overrides
YMapComplexEntity.constructor

Properties
defaultProps
static defaultProps: Readonly<{
	maxWidth: 74;
	unit: "metric" 
}>
Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapComplexEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapComplexEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapScaleControlProps>	New props values.
Returns
void

Inherited from
YMapComplexEntity.update

Class: YMapTileDataSource
Create map tile data source.

Example

const layer = new YMapLayer({
    id: 'layer-source-ground',
    source: 'source',
    type: 'ground',
    raster: {
        awaitAllTilesOnFirstDisplay: true
    }
});
const map = new YMap(ref.current, {
    location: [37.622504, 55.753215],
    mode: 'vector'
});
map.addChild(new YMapTileDataSource({
    id: 'source',
    raster: {
        type: 'ground',
        fetchTile: 'https://my.host.example/tiles?x=x&y=y&z=z&scale=scale'
    },
    zoomRange: {min: 0, max: 19},
    clampMapZoom: true
}));
map.addChild(layer);
Constructors
constructor
new YMapTileDataSource(props)

Parameters
Name	Type	Description
props	YMapTileDataSourceProps	The value of input props.
Inherited from
YMapEntity.constructor

Accessors
parent
get parent(): null | YMapComplexEntity<unknown, {}>

Get parent entity.

Returns
null | YMapComplexEntity<unknown, {}>

Inherited from
YMapEntity.parent

root
get root(): null | YMap

Get root entity.

Returns
null | YMap

Inherited from
YMapEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<YMapTileDataSourceProps>	New props values.
Returns
void

Inherited from
YMapEntity.update

Class: Context<_T>
Type parameters
Name
_T
Constructors
constructor
new Context<_T>(name)

Type parameters
Name
_T
Parameters
Name	Type
name	string
Properties
name
readonly name: string
Class: GenericComplexEntity<Props, DefaultProps, Root>
Entity that aggregates multiple Entities but looks basic from the outside.

Example

type YMapSomeComplexEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeComplexEntity extends GenericComplexEntity<YMapSomeComplexEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 private _someEntity?: YMapSomeEntity; // YMapSomeEntity extends GenericEntity
 protected _onAttach(): void {
     this._someEntity = new YMapSomeEntity();
     this.addChild(this._someEntity); // add someEntity as children
     // ...
 }
 // ...
}
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Root	extends GenericRootEntity<unknown> = GenericRootEntity<unknown>	Root Entity Class.
Constructors
constructor
new GenericComplexEntity<Props, DefaultProps, Root>(props, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Root	extends GenericRootEntity<unknown, {}, Root> = GenericRootEntity<unknown, {}>
Parameters
Name	Type	Description
props	Props	The value of input props.
options?	ComplexOptions<Root>	Optional options object.
Overrides
GenericEntity.constructor

new GenericComplexEntity<Props, DefaultProps, Root>(props, children?, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Root	extends GenericRootEntity<unknown, {}, Root> = GenericRootEntity<unknown, {}>
Parameters
Name	Type
props	Props
children?	GenericEntity<unknown, {}, Root>[]
options?	Omit<ComplexOptions<Root>, "children">
Overrides
GenericEntity<Props, DefaultProps, Root&gt;.constructor

Accessors
parent
get parent(): null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Get parent entity.

Returns
null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Inherited from
GenericEntity.parent

root
get root(): null | Root

Get root entity.

Returns
null | Root

Inherited from
GenericEntity.root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Inherited from
GenericEntity.update

Class: GenericEntity<Props, DefaultProps, Root>
Entity Base Class. It has event handlers for attaching, detaching and updating props. Has a method for providing and using context.

Example

type YMapSomeEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeEntity extends GenericEntity<YMapSomeEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 public isAttached: boolean;
 constructor(props: YMapSomeEntityProps) {
     super(props);
     this.isAttached = false
     // Additional actions can be taken in the constructor of a class.
 }
 protected _onAttach(): void {
     this.isAttached = true;
     // Additional actions can be taken when an Entity is attached.
 }
 // ...
}
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Root	extends GenericRootEntity<unknown> = GenericRootEntity<unknown>	Root Entity Class.
Constructors
constructor
new GenericEntity<Props, DefaultProps, Root>(props)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Root	extends GenericRootEntity<unknown, {}, Root> = GenericRootEntity<unknown, {}>
Parameters
Name	Type	Description
props	Props	The value of input props.
Accessors
parent
get parent(): null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Get parent entity.

Returns
null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

root
get root(): null | Root

Get root entity.

Returns
null | Root

Methods
update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Class: GenericGroupEntity<Props, DefaultProps, Root>
Entity that aggregates multiple Entities, and allows you to publicly add and remove entities to a subtree.

Example

type YMapSomeGroupEntityProps = {
 name?: string;
};
const defaultProps = {
 name: 'entity'
};
class YMapSomeGroupEntity extends GenericGroupEntity<YMapSomeGroupEntityProps, typeof defaultProps> {
 static defaultProps = defaultProps;
 // ...
}
const groupEntity = new YMapSomeGroupEntity()
const someEntity = new YMapSomeEntity(); // YMapSomeEntity extends GenericEntity
groupEntity.addChild(someEntity); // add someEntity in YMapSomeGroupEntity object
groupEntity.removeChild(someEntity); // remove someEntity from YMapSomeGroupEntity object
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Root	extends GenericRootEntity<unknown> = GenericRootEntity<unknown>	Root Entity Class.
Constructors
constructor
new GenericGroupEntity<Props, DefaultProps, Root>(props, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Root	extends GenericRootEntity<unknown, {}, Root> = GenericRootEntity<unknown, {}>
Parameters
Name	Type	Description
props	Props	The value of input props.
options?	ComplexOptions<Root>	Optional options object.
Inherited from
GenericComplexEntity.constructor

new GenericGroupEntity<Props, DefaultProps, Root>(props, children?, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Root	extends GenericRootEntity<unknown, {}, Root> = GenericRootEntity<unknown, {}>
Parameters
Name	Type
props	Props
children?	GenericEntity<unknown, {}, Root>[]
options?	Omit<ComplexOptions<Root>, "children">
Inherited from
GenericComplexEntity.constructor

Properties
children
readonly children: readonly GenericEntity<unknown, {}, Root>[]
Overrides
GenericComplexEntity.children

Accessors
parent
get parent(): null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Get parent entity.

Returns
null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Inherited from
GenericComplexEntity.parent

root
get root(): null | Root

Get root entity.

Returns
null | Root

Inherited from
GenericComplexEntity.root

Methods
addChild
addChild(child, index?): GenericGroupEntity<Props, DefaultProps, Root>

Parameters
Name	Type
child	GenericEntity<unknown, {}, Root>
index?	number
Returns
GenericGroupEntity<Props, DefaultProps, Root>

Overrides
GenericComplexEntity.addChild

removeChild
removeChild(child): GenericGroupEntity<Props, DefaultProps, Root>

Parameters
Name	Type
child	GenericEntity<unknown, {}, Root>
Returns
GenericGroupEntity<Props, DefaultProps, Root>

Overrides
GenericComplexEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Inherited from
GenericComplexEntity.update

Class: GenericRootEntity<Props, DefaultProps>
Entity that is root and cannot be added anywhere

Example

type YMapProps = {
 name?: string;
};
class YMap extends GenericRootEntity<YMapProps, typeof defaultProps> {
 // ...
}
// Now we can specify their root element for the Entity
class YMapSomeEntity extends GenericEntity<YMapSomeEntityProps, typeof defaultProps, YMap> {
 static defaultProps = defaultProps;
 // ...
}
Type parameters
Name	Type	Description
Props	Props	Type of input props of the Entity.
DefaultProps	extends Object = {}	Type of default input props of the Entity.
Constructors
constructor
new GenericRootEntity<Props, DefaultProps>(props, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type	Description
props	Props	The value of input props.
options?	ComplexOptions<GenericRootEntity<unknown, {}>>	Optional options object.
Inherited from
GenericGroupEntity.constructor

new GenericRootEntity<Props, DefaultProps>(props, children?, options?)

Type parameters
Name	Type
Props	Props
DefaultProps	extends Object = {}
Parameters
Name	Type
props	Props
children?	GenericEntity<unknown, {}, GenericRootEntity<unknown, {}>>[]
options?	Omit<ComplexOptions<GenericRootEntity<unknown, {}>>, "children">
Inherited from
GenericGroupEntity.constructor

Properties
children
readonly children: readonly GenericEntity<unknown, {}, GenericRootEntity<unknown, {}>>[]
Inherited from
GenericGroupEntity.children

Accessors
parent
get parent(): null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Get parent entity.

Returns
null | GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>

Inherited from
GenericGroupEntity.parent

root
get root(): this

Get root entity.

Returns
this

Overrides
GenericGroupEntity.root

Methods
addChild
addChild(child, index?): GenericRootEntity<Props, DefaultProps>

Parameters
Name	Type
child	GenericEntity<unknown, {}, GenericRootEntity<unknown, {}>>
index?	number
Returns
GenericRootEntity<Props, DefaultProps>

Inherited from
GenericGroupEntity.addChild

destroy
Abstract destroy(): void

Completely destroys the entity tree including the current entity

Returns
void

removeChild
removeChild(child): GenericRootEntity<Props, DefaultProps>

Parameters
Name	Type
child	GenericEntity<unknown, {}, GenericRootEntity<unknown, {}>>
Returns
GenericRootEntity<Props, DefaultProps>

Inherited from
GenericGroupEntity.removeChild

update
update(changedProps): void

Method for updating props of Entity.

Parameters
Name	Type	Description
changedProps	Partial<Props>	New props values.
Returns
void

Inherited from
GenericGroupEntity.update

Interface: BaseRouteResponse
Methods
toRoute
toRoute(): RouteFeature

Return requested route as RouteFeature.

Returns
RouteFeature

toSteps
toSteps(): RouteFeature[]

Returns requested route, divided into steps, as RouteFeature[].

Returns
RouteFeature[]

Interface: DomEvent
Properties
coordinates
readonly coordinates: LngLat
details
readonly details: CommonDetails
screenCoordinates
readonly screenCoordinates: [number, number]
[x, y]

Methods
stopPropagation
stopPropagation(): void

Returns
void

Interface: DrawingStyle
Properties
cursor
optional cursor: string
element
optional element: HTMLElement
fill
optional fill: string
fillOpacity
optional fillOpacity: number
fillRule
optional fillRule: FillRule
icon
optional icon: DrawingStyleIcon
interactive
optional interactive: boolean
simplificationRate
optional simplificationRate: number
stroke
optional stroke: Stroke
zIndex
optional zIndex: number
Interface: DrawingStyleIcon
Properties
offset
optional readonly offset: [number, number]
scale
optional readonly scale: number
url
readonly url: string
Interface: MouseDomEvent
Properties
coordinates
readonly coordinates: LngLat
Inherited from
DomEvent.coordinates

details
readonly details: MouseEventDetails
Overrides
DomEvent.details

screenCoordinates
readonly screenCoordinates: [number, number]
[x, y]

Inherited from
DomEvent.screenCoordinates

Methods
stopPropagation
stopPropagation(): void

Returns
void

Inherited from
DomEvent.stopPropagation

Interface: PointerDomEvent
Properties
coordinates
readonly coordinates: LngLat
Inherited from
DomEvent.coordinates

details
readonly details: PointerEventDetails
Overrides
DomEvent.details

screenCoordinates
readonly screenCoordinates: [number, number]
[x, y]

Inherited from
DomEvent.screenCoordinates

Methods
stopPropagation
stopPropagation(): void

Returns
void

Inherited from
DomEvent.stopPropagation

Interface: RasterTileDataSourceDescription
Properties
fetchHotspots
optional fetchHotspots: FetchHotspotsFunction
Returns promise that is going to be resolved by hotspots for tile, or rejected with {name: 'AbortError'}.
Hotspots are expected to be sorted from bottom to top (aka far to near).

fetchTile
fetchTile: string | ComposeTileUrlFunction | FetchTileFunction
Either template tile url:

x y z placeholders for tile coordinates
scale placeholders for pixel scale (e.g. retina is 2)
Or function that returns final url.
Or function that fetches tile manually.
hotspotAbortRadius
optional hotspotAbortRadius: number
Defines maximum distance between tile and pointer, till which we keep alive unfinished requests
for hotspots for that tile.

hotspotInset
optional hotspotInset: number
Defines how far inside into tile hotspots from other tile can go.
For example, tile may have a little part of POI from neightbour tile, but no hotspot for it in data.

hotspotPadding
optional hotspotPadding: number
Defines how much pixels should be added to hotspot to increase its area.
Moves each point of hotspot X pixels away from the center of the hotspots.
NOTE: Currently works only on hotspots with Polygon geometry.

size
optional size: number
Tile size in pixels. Default is 256.

transparent
optional transparent: boolean
type
type: string
Name of data provided by this data source. Should be referenced in layer.

Interface: RouteFeature
Properties
geometry
geometry: LineStringGeometry
Overrides
GenericFeature.geometry

id
id: string
Inherited from
GenericFeature.id

properties
properties: Object
Type declaration
Name	Type
bounds?	LngLatBounds
duration?	number
featureClass?	string
flags?	{ hasNonTransactionalTolls?: boolean ; hasTolls?: boolean }
flags.hasNonTransactionalTolls?	boolean
flags.hasTolls?	boolean
length?	number
mode?	string
Overrides
GenericFeature.properties

type
type: "Feature"
Inherited from
GenericFeature.type

Interface: RouteOptions
Properties
avoidTolls
optional avoidTolls: boolean
Avoid roads with tolls. Default is false.

bounds
optional bounds: boolean
If specified, bounding box of the route will be returned in properties. Default is false.

points
points: LngLat[]
Route points represented by LngLat coordinates.

truck
optional truck: TruckParameters
Parameters for a truck (only for type=truck).

type
type: "driving" | "transit" | "truck" | "walking"
Route type.

Interface: TouchDomEvent
Properties
coordinates
readonly coordinates: LngLat
Inherited from
DomEvent.coordinates

details
readonly details: TouchEventDetails
Overrides
DomEvent.details

screenCoordinates
readonly screenCoordinates: [number, number]
[x, y]

Inherited from
DomEvent.screenCoordinates

Methods
stopPropagation
stopPropagation(): void

Returns
void

Inherited from
DomEvent.stopPropagation

Interface: TruckParameters
Properties
axleWeight
optional axleWeight: number
Actual vehicle axle load in tons

ecoClass
optional ecoClass: number
Vehicle emission standard (number from 1 to 6, for example, 1 corresponds to Euro-1 class)

hasTrailer
optional hasTrailer: boolean
Has a truck trailer

height
optional height: number
Vehicle height in meters

length
optional length: number
Vehicle length in meters

maxWeight
optional maxWeight: number
Maximum allowed vehicle weight in tons

payload
optional payload: number
Maximum vehicle load capacity in tons

weight
optional weight: number
Vehicle weight in tons

width
optional width: number
Vehicle width in meters

Interface: VectorTileDataSourceDescription
Properties
allObjectsInteractive
optional allObjectsInteractive: boolean
cameraIdleThrottling
optional cameraIdleThrottling: number
Milliseconds

collisionPriority
optional collisionPriority: VectorObjectsCollisionPriority
customization
optional customization: Customization
fontListRequestHeaders
optional fontListRequestHeaders: Record<string, string>
fontListRequestWithCredentials
optional fontListRequestWithCredentials: boolean
fontListUrl
optional fontListUrl: string
fontObjectRequestHeaders
optional fontObjectRequestHeaders: Record<string, string>
fontObjectRequestWithCredentials
optional fontObjectRequestWithCredentials: boolean
fontObjectUrl
optional fontObjectUrl: string
glyphRangeUrl
optional glyphRangeUrl: string
glyphRequestHeaders
optional glyphRequestHeaders: Record<string, string>
glyphRequestWithCredentials
optional glyphRequestWithCredentials: boolean
hdModeEnabled
optional hdModeEnabled: boolean
hotspots
optional hotspots: Record<string, boolean | FetchHotspotsFunction | HotspotsOptions>
Defines how hotspots of type should be treated: enabled/disabled or use custom hotspots instead.

iconRequestHeaders
optional iconRequestHeaders: Record<string, string>
iconsOnlyTiles
optional iconsOnlyTiles: boolean
Forces tiles to wait for the icons, disables hiding icons by zoom diff

imageRequestWithCredentials
optional imageRequestWithCredentials: boolean
imageUrl
optional imageUrl: string
indoorPlanRequestHeaders
optional indoorPlanRequestHeaders: Record<string, string>
indoorPlanRequestWithCredentials
optional indoorPlanRequestWithCredentials: boolean
indoorPlanUrl
optional indoorPlanUrl: string
lowPrecisionBeltTiles
optional lowPrecisionBeltTiles: boolean
meshRequestHeaders
optional meshRequestHeaders: Record<string, string>
meshRequestWithCredentials
optional meshRequestWithCredentials: boolean
meshUrl
optional meshUrl: string
priority
priority: VectorDataSourcePriority
requestTileSize
optional requestTileSize: VectorTileSize
richModelCacheSize
optional richModelCacheSize: number
richModelDecoderWorkerUrl
optional richModelDecoderWorkerUrl: string
richModelEnabled
optional richModelEnabled: boolean
richModelRequestHeaders
optional richModelRequestHeaders: Record<string, string>
richModelRequestWithCredentials
optional richModelRequestWithCredentials: boolean
richModelUrl
optional richModelUrl: string
richPointEnabled
optional richPointEnabled: boolean
styleRequestHeaders
optional styleRequestHeaders: Record<string, string>
styleRequestWithCredentials
optional styleRequestWithCredentials: boolean
styleUrl
optional styleUrl: string
theme
optional theme: "dark"
tileBeltSize
optional tileBeltSize: number
tileCacheSize
optional tileCacheSize: number
tileFormat
optional tileFormat: "vmap2" | "vmap3"
Default is 'vmap2'

tileRequestHeaders
optional tileRequestHeaders: Record<string, string>
tileRequestWithCredentials
optional tileRequestWithCredentials: boolean
tileUrl
tileUrl: string
Interface: YMapContainerProps<TContext>
Type parameters
Name
TContext
Properties
className
optional className: string
context
optional context: Context<TContext>
style
optional style: CSSProperties
tagName
optional tagName: string
Interface: YMapContainerPropsImpl<TContext>
Type parameters
Name
TContext
Properties
onContext
onContext: (`context?`: TContext) => void
Type declaration
(context?): void

Parameters
Name	Type
context?	TContext
Returns
void

onElement
onElement: (`element?`: Element) => void
Type declaration
(element?): void

Parameters
Name	Type
element?	Element
Returns
void

Interface: YMapTileDataSourceProps
YMapTileDataSource props

Properties
clampMapZoom
optional clampMapZoom: boolean
Restrict min and max map zoom.
Result map zoomRange will be the intersection of the map zoomRange
and all data sources with the clampMapZoom option enabled

copyrights
optional copyrights: string[]
Data source copyrights

id
id: string
Data source id

raster
optional raster: RasterTileDataSourceDescription
Raster data source description

zoomRange
optional zoomRange: ZoomRange
Min and max zoom for tiles

Interface: ZoomRange
Properties
max
max: number
min
min: number
Interface: Apikeys
All possible apikeys for http-services.

Properties
router
optional router: string
search
optional search: string
suggest
optional suggest: string
Interface: BlockingProps
Properties
blockBehaviors
optional blockBehaviors: boolean
This parameter block all map behaviors for the element.
The element itself can be zoomed and scrolled by mouse and gestures.
The map will no longer be able to respond to any BehaviorType on this element (except dblClick).
Double clicks and other map events will be blocked by the blockEvents parameter.

blockEvents
optional blockEvents: boolean
This parameter block all map events for the element.
The map will no longer be able to respond to any DomEvents on this element, including clicks, double-clicks and others.

Interface: Camera
Properties
azimuth
readonly azimuth: number
tilt
readonly tilt: number
worldCenter
readonly worldCenter: WorldCoordinates
zoom
readonly zoom: number
Interface: ComplexOptions<Root>
Type parameters
Name	Type
Root	extends GenericRootEntity<unknown> = GenericRootEntity<unknown>
Properties
children
optional children: GenericEntity<unknown, {}, Root>[]
container
optional container: boolean
Interface: DraggableProps<Callback>
Type parameters
Name
Callback
Properties
draggable
optional draggable: boolean
Feature can be draggable

mapFollowsOnDrag
optional mapFollowsOnDrag: boolean | {
	activeZoneMargin?: Margin 
}
Will map center follows marker on drag if marker near the edge of the map

onDragEnd
optional onDragEnd: Callback
May be a function that will be called when the user drags and drops an element to a new location on the map.
The arguments to the function will include the new coordinates.
A component that uses this component should immediately save the new coordinates in its state and then use
the new coordinates as props for the marker.

onDragMove
optional onDragMove: Callback
Fires on drag move

onDragStart
optional onDragStart: Callback
Fires on drag start

Interface: FeatureClickEvents
Properties
onClick
optional onClick: (`event`: MouseEvent, `mapEvent`: MapEvent) => void
Type declaration
(event, mapEvent): void

Click handler

Parameters
Name	Type
event	MouseEvent
mapEvent	MapEvent
Returns
void

onDoubleClick
optional onDoubleClick: (`event`: MouseEvent, `mapEvent`: MapEvent) => void
Type declaration
(event, mapEvent): void

Double click handler

Parameters
Name	Type
event	MouseEvent
mapEvent	MapEvent
Returns
void

onFastClick
optional onFastClick: (`event`: MouseEvent, `mapEvent`: MapEvent) => void
Type declaration
(event, mapEvent): void

Fast click handler

Parameters
Name	Type
event	MouseEvent
mapEvent	MapEvent
Returns
void

Interface: FeatureMouseEvents
Properties
onMouseEnter
optional onMouseEnter: (`event`: MouseEvent, `mapEvent`: MapEvent) => void
Type declaration
(event, mapEvent): void

Parameters
Name	Type
event	MouseEvent
mapEvent	MapEvent
Returns
void

onMouseLeave
optional onMouseLeave: (`event`: MouseEvent, `mapEvent`: MapEvent) => void
Type declaration
(event, mapEvent): void

Parameters
Name	Type
event	MouseEvent
mapEvent	MapEvent
Returns
void

Interface: FetchedCommonTile
Methods
destroy
Optional destroy(): void

Returns
void

Interface: FetchedRasterTile
Properties
image
image: ImageBitmap | HTMLCanvasElement | HTMLImageElement
Methods
destroy
Optional destroy(): void

Returns
void

Inherited from
FetchedCommonTile.destroy

Interface: GenericFeature<TCoordinates>
Type parameters
Name
TCoordinates
Properties
geometry
geometry: GenericGeometry<TCoordinates>
id
id: string
properties
optional properties: Record<string, unknown>
type
type: "Feature"
Interface: GenericLineStringGeometry<TCoordinates>
Type parameters
Name
TCoordinates
Properties
coordinates
coordinates: TCoordinates[]
type
type: "LineString"
Interface: GenericMultiLineStringGeometry<TCoordinates>
Type parameters
Name
TCoordinates
Properties
coordinates
coordinates: TCoordinates[][]
type
type: "MultiLineString"
Interface: GenericMultiPolygonGeometry<TCoordinates>
Type parameters
Name
TCoordinates
Properties
coordinates
coordinates: TCoordinates[][][]
Array of polygons. See GenericPolygonGeometry.

type
type: "MultiPolygon"
Interface: GenericPointGeometry<TCoordinates>
Type parameters
Name
TCoordinates
Properties
coordinates
coordinates: TCoordinates
type
type: "Point"
Interface: GenericPolygonGeometry<TCoordinates>
Type parameters
Name
TCoordinates
Properties
coordinates
coordinates: TCoordinates[][]
Polygon's rings.

Remarks

Inner rings may extend beyond outer ring.
GeoJSON doesn't allow this, but there's a lot of data like this in this JS API.

type
type: "Polygon"
Interface: GenericProjection<TSource>
Type parameters
Name
TSource
Properties
type
optional readonly type: string
Projection identity type. It may be:

EPSG-code (e.g. EPSG:3857)
any other string to identify (e.g. 'cartesian')
Methods
fromWorldCoordinates
fromWorldCoordinates(coordinates): TSource

Parameters
Name	Type
coordinates	WorldCoordinates
Returns
TSource

toWorldCoordinates
toWorldCoordinates(point): WorldCoordinates

Parameters
Name	Type
point	TSource
Returns
WorldCoordinates

Interface: HotspotFeature<TCoordinates>
Type parameters
Name
TCoordinates
Properties
geometry
optional geometry: GenericGeometry<TCoordinates>
id
id: string
properties
properties: Record<string, unknown>
type
type: "Feature"
Interface: HotspotsOptions
Properties
minZoom
optional minZoom: number
Interface: IndoorLevel
Properties
id
id: string
isUnderground
optional isUnderground: boolean
name
name: string
Interface: IndoorPlan
Properties
source
source: string
Methods
getActiveLevel
getActiveLevel(): IndoorLevel

Returns
IndoorLevel

getBounds
getBounds(): [[number, number], [number, number]]

Returns bounds of indoor plan in [[lng, lat], [lng, lat]].

Returns
[[number, number], [number, number]]

getDefaultLevel
getDefaultLevel(): IndoorLevel

Returns
IndoorLevel

getId
getId(): string

Returns
string

getLevels
getLevels(): IndoorLevel[]

Returns
IndoorLevel[]

getOpacity
getOpacity(): number

Returns
number

isVisible
isVisible(): boolean

Returns
boolean

setActiveLevel
setActiveLevel(id): void

Parameters
Name	Type
id	string
Returns
void

setOpacity
setOpacity(value): void

Parameters
Name	Type
value	number
Returns
void

setVisible
setVisible(value): void

Parameters
Name	Type
value	boolean
Returns
void

Interface: LayerImplementationClasses
Callable
LayerImplementationClasses
LayerImplementationClasses<Result>(props): Result

Type parameters
Name	Type
Result	extends RasterLayerImplementationConstructor = RasterLayerImplementationConstructor
Parameters
Name	Type
props	LayerImplementationClassesProps<"raster">
Returns
Result

LayerImplementationClasses
LayerImplementationClasses<Result>(props): Result

Type parameters
Name	Type
Result	extends VectorLayerImplementationConstructor = VectorLayerImplementationConstructor
Parameters
Name	Type
props	LayerImplementationClassesProps<"vector">
Returns
Result

Interface: LayerImplementationRenderProps
Properties
size
size: PixelCoordinates
Interface: MapEvent
Properties
coordinates
readonly coordinates: LngLat
details
readonly details: Pick<PointerEvent | MouseEvent | TouchEvent, "type" | "altKey" | "metaKey" | "shiftKey">
screenCoordinates
readonly screenCoordinates: [number, number]
[x, y]

Methods
stopPropagation
stopPropagation(): void

Returns
void

Interface: MapState
Methods
getLayerState
getLayerState(layerId, type, effectiveMode?): undefined | Record<string, unknown>

Parameters
Name	Type
layerId	string
type	string
effectiveMode?	"raster" | "vector"
Returns
undefined | Record<string, unknown>

getLayerState(layerId, type, effectiveMode?): undefined | TileLayerState

Parameters
Name	Type
layerId	string
type	"tile"
effectiveMode?	"raster" | "vector"
Returns
undefined | TileLayerState

Interface: Matrix4
Matrix stored as an array in column-major order:

[
    m11, m21, m31, m41,
    m12, m22, m32, m42,
    m13, m23, m33, m43,
    m14, m24, m34, m44
],

where mij - matrix element in the i-th row and j-th column.

Indexable
▪ [i: number]: number

Properties
length
readonly length: number
Interface: PaletteEntry
Properties
color
color: string
count
count: number
Interface: PixelCoordinates
Global pixel coordinates. World size depends on zoom.
Left top is (0; 0).
Right bottom is (2**(zoom + 8); 2**(zoom + 8)).

Properties
type
optional readonly type: "pixel"
x
x: number
Inherited from
Vec2.x

y
y: number
Inherited from
Vec2.y

Interface: RasterLayerImplementation
Methods
destroy
Optional destroy(): void

Returns
void

findObjectInPosition
Optional findObjectInPosition(coords): unknown

Parameters
Name	Type
coords	Object
coords.screenCoordinates	PixelCoordinates
coords.worldCoordinates	WorldCoordinates
Returns
unknown

render
render(props): void

Parameters
Name	Type
props	RasterLayerImplementationRenderProps
Returns
void

Interface: RasterLayerImplementationConstructor
Constructors
constructor
new RasterLayerImplementationConstructor(props)

Parameters
Name	Type
props	RasterLayerImplementationConstructorProps
Interface: RasterLayerImplementationConstructorProps
Properties
camera
camera: Camera
element
element: HTMLElement
options
optional options: RasterLayerOptions
projection
projection: GenericProjection<unknown>
requestRender
requestRender: () => void
Type declaration
(): void

Returns
void

size
size: PixelCoordinates
worldOptions
worldOptions: WorldOptions
Interface: RasterLayerImplementationRenderProps
Properties
camera
camera: Camera & {
	fov: number 
}
size
size: PixelCoordinates
Inherited from
LayerImplementationRenderProps.size

worlds
worlds: WorldOffset[]
Interface: ReactParent
Properties
entityRef
entityRef: RefInstance<GenericEntity<unknown, {}, GenericRootEntity<unknown, {}>>>
Methods
positionChild
positionChild(entity): number

Parameters
Name	Type
entity	RefInstance<GenericEntity<unknown, {}, GenericRootEntity<unknown, {}>>>
Returns
number

requestReposition
requestReposition(): void

Returns
void

Interface: RenderedHotspot
Properties
feature
readonly feature: HotspotFeature<unknown>
geometry
readonly geometry: GenericGeometry<PixelCoordinates>
type
readonly type: "rendered"
Interface: ResizeObject
Properties
mapInAction
mapInAction: boolean
size
size: Readonly<PixelCoordinates>
type
type: "resize"
Interface: StrokeStyle
Properties
color
optional color: string
dash
optional dash: number[]
opacity
optional opacity: number
palette
optional palette: Palette
simplifyPalette
optional simplifyPalette: boolean
width
optional width: number
Interface: TileLayerState
Properties
tilesLoaded
tilesLoaded: number
Number of tiles loaded from the server.

tilesReady
tilesReady: number
Number of tiles ready to be displayed.

tilesTotal
tilesTotal: number
Total number of tiles in the visible area.

Interface: TiltRange
Properties
expansion
readonly expansion: number
Behavior tilt expansion in radians. E.g. you can tilt map with fingers a little bit more than max.

max
readonly max: number
Maximum tilt in radians.

min
readonly min: number
Minimum tilt in radians.

Interface: UpdateObject
Properties
camera
camera: YMapCamera
location
location: Required<YMapLocation>
mapInAction
mapInAction: boolean
type
type: "update"
Interface: Vec2
Properties
x
x: number
y
y: number
Interface: VectorLayerImplementation
Methods
destroy
destroy(): void

Returns
void

render
render(props): Object

Parameters
Name	Type
props	VectorLayerImplementationRenderProps
Returns
Object

Name	Type
color	WebGLTexture
depth?	WebGLTexture
Interface: VectorLayerImplementationConstructor
Constructors
constructor
new VectorLayerImplementationConstructor(gl, options)

Parameters
Name	Type
gl	WebGLRenderingContext
options	Object
options.requestRender	() => void
Interface: VectorLayerImplementationRenderProps
Properties
camera
camera: Camera & {
	fov: number 
}
size
size: PixelCoordinates
Inherited from
LayerImplementationRenderProps.size

worlds
worlds: {
	lookAt: Vec2;
	viewProjMatrix: Matrix4 
}[]
Interface: WorldCoordinates
Coordinates in [-1 ... +1].
Left bottom is (-1; -1).
Right top is (+1; +1).
Center is (0; 0).

Properties
type
optional readonly type: "world"
x
x: number
Inherited from
Vec2.x

y
y: number
Inherited from
Vec2.y

z
optional z: number
Interface: WorldHotspot
Properties
feature
readonly feature: HotspotFeature<unknown>
geometry
readonly geometry: GenericGeometry<WorldCoordinates>
type
readonly type: "world"
Interface: WorldOffset
Properties
height
readonly height: number
left
readonly left: number
top
readonly top: number
width
readonly width: number
Interface: WorldOptions
Properties
cycledX
readonly cycledX: boolean
cycledY
readonly cycledY: boolean
Type Aliases
BehaviorEvents
BehaviorEvents: Object
Type declaration
Name	Type
onActionEnd	BehaviorMapEventHandler
onActionStart	BehaviorStartHandler
BehaviorMapEvent
BehaviorMapEvent: Object
Type declaration
Name	Type
camera	YMapCamera
location	Location
type	"pinchZoom" | "scrollZoom" | "dblClick" | "magnifier" | "oneFingerZoom" | "mouseRotate" | "mouseTilt" | "pinchRotate" | "panTilt"
BehaviorMapEventHandler
BehaviorMapEventHandler: (`event`: {
	camera: YMapCamera;
	location: Location;
	type: BehaviorType 
}) => void
Type declaration
(event): void

Parameters
Name	Type
event	Object
event.camera	YMapCamera
event.location	Location
event.type	BehaviorType
Returns
void

BehaviorStartHandler
BehaviorStartHandler: (`event`: BehaviorMapEvent | DragMapEvent) => void
Type declaration
(event): void

Parameters
Name	Type
event	BehaviorMapEvent | DragMapEvent
Returns
void

BehaviorType
BehaviorType: "drag" | "pinchZoom" | "scrollZoom" | "dblClick" | "magnifier" | "oneFingerZoom" | "mouseRotate" | "mouseTilt" | "pinchRotate" | "panTilt"
ComputedYMapContainerProps
ComputedYMapContainerProps<TContext\>: YMapContainerProps<TContext> & YMapContainerPropsImpl<TContext>
Type parameters
Name
TContext
DomDetach
DomDetach: () => void
Type declaration
(): void

Returns
void

DomEventHandler
DomEventHandler: (`object`: DomEventHandlerObject, `event`: DomEvent) => void
Type declaration
(object, event): void

Parameters
Name	Type
object	DomEventHandlerObject
event	DomEvent
Returns
void

DomEventHandlerObject
DomEventHandlerObject: HandlerEntity<"feature", YMapFeature> | HandlerEntity<"marker", YMapMarker> | HandlerEntity<"hotspot", YMapHotspot> | undefined
DomEvents
DomEvents: Object
Type declaration
Name	Type
onClick	DomEventHandler
onContextMenu	DomEventHandler
onDblClick	DomEventHandler
onFastClick	DomEventHandler
onMouseDown	MouseDomEventHandler
onMouseEnter	MouseDomEventHandler
onMouseLeave	MouseDomEventHandler
onMouseMove	MouseDomEventHandler
onMouseUp	MouseDomEventHandler
onPointerCancel	PointerDomEventHandler
onPointerDown	PointerDomEventHandler
onPointerMove	PointerDomEventHandler
onPointerUp	PointerDomEventHandler
onRightDblClick	DomEventHandler
onTouchCancel	TouchDomEventHandler
onTouchEnd	TouchDomEventHandler
onTouchMove	TouchDomEventHandler
onTouchStart	TouchDomEventHandler
DragMapEvent
DragMapEvent: Object
Type declaration
Name	Type
camera	YMapCamera
location	Location
points	{ length: number }
points.length	number
preventDefault	() => void
type	"drag"
EasingBezierPreset
EasingBezierPreset: Object
Type declaration
Name	Type
p1	Vec2
p2	Vec2
EasingFunction
EasingFunction: (`x`: number) => number
Type declaration
(x): number

Parameters
Name	Type
x	number
Returns
number

EasingFunctionDescription
EasingFunctionDescription: EasingPresetName | EasingBezierPreset | EasingFunction
EasingPresetName
EasingPresetName: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
Feature
Feature: Object
Type declaration
Name	Type
geometry?	{ coordinates: LngLat ; type: "Point" }
geometry.coordinates	LngLat
geometry.type	"Point"
properties	{ description: string ; name: string }
properties.description	string
properties.name	string
FetchConfigOptions
FetchConfigOptions: Object
Request options

Type declaration
Name	Type	Description
dataProvider?	string	Data provider
lang	string	Language
signal?	AbortSignal	Signal to abort request
IndoorPlansHandler
IndoorPlansHandler: (`object`: {
	indoorPlans: readonly IndoorPlan[] | null;
	type: IndoorPlanType 
}) => void
Type declaration
(object): void

Parameters
Name	Type
object	Object
object.indoorPlans	readonly IndoorPlan[] | null
object.type	IndoorPlanType
Returns
void

LngLat
LngLat: [lon: number, lat: number, alt?: number]
Tuple with geodesic coordinates in longitude latitude order.
GeoJSON also uses this order https://tools.ietf.org/html/rfc7946#appendix-A.1

LngLatBounds
LngLatBounds: GenericBounds<LngLat>
Rectangle bounded by top-left and bottom-right coordinates

MapEventReadyStateChangeHandler
MapEventReadyStateChangeHandler: MapEventHandler<MapState>
MapEventResizeHandler
MapEventResizeHandler: MapEventHandler<ResizeObject>
MapEventUpdateHandler
MapEventUpdateHandler: MapEventHandler<UpdateObject>
MapEvents
MapEvents: Object
Type declaration
Name	Type
onResize	MapEventResizeHandler
onStateChanged	MapEventReadyStateChangeHandler
onUpdate	MapEventUpdateHandler
MapMode
MapMode: "raster" | "vector" | "auto"
Margin
Margin: [number, number, number, number]
Map margins in pixels. Order is top, right, bottom, left.

MouseDomEventHandler
MouseDomEventHandler: (`object`: DomEventHandlerObject, `event`: MouseDomEvent) => void
Type declaration
(object, event): void

Parameters
Name	Type
object	DomEventHandlerObject
event	MouseDomEvent
Returns
void

NullablePartial
NullablePartial<T\>: { [P in keyof T]?: T[P] \| null }
Type parameters
Name
T
PointerDomEventHandler
PointerDomEventHandler: (`object`: DomEventHandlerObject, `event`: PointerDomEvent) => void
Type declaration
(object, event): void

Parameters
Name	Type
object	DomEventHandlerObject
event	PointerDomEvent
Returns
void

RasterLayerOptions
RasterLayerOptions: Record<string, unknown> & {
	awaitAllTilesOnFirstDisplay?: boolean;
	opacity?: number;
	tileRevealDuration?: number 
}
ReadonlyLngLat
ReadonlyLngLat: Readonly<LngLat>
Readonly version of LngLat

SearchOptions
SearchOptions: Object
Type declaration
Name	Type	Description
bounds?	LngLatBounds	bounds parameter has priority over center and SearchOptions.spn span
center?	LngLat	LngLat of the center point of search area. span parameter sets the length of the search area.
limit?	number	The maximum amount of returned objects. Parameter has to be specified explicitly if offset parameter is provided. 10 is default. 100 is maximum.
offset?	number	The amount of objects (if any returned) that are skipped starting from the first one. Parameter limit must be provided.
span?	LngLat	Parameter span is specified with two numbers that represent differences between the minimum and maximum: - longitude of the area - latitude of the area
strictBounds?	boolean	Flag that defines whether search area is restricted by the provided parameters. Area restriction is specified by center and span parameters or bounds parameter. false — the search area is not restricted true — the search area is restricted
text?	string	Request string represented by a text or LngLat point.
type?	SearchType[]	type parameter specifies the type of objects that are being searched (and the order of objects if both types are queried): - toponyms - businesses
uri?	string	Additional information about the object. The parameter value is returned in the Geosuggest response. To use it in a request, specify a value instead of text.
zoom?	number	Deprecated Map zoom.
SearchResponse
SearchResponse: Feature[]
SearchType
SearchType: "businesses" | "toponyms"
SuggestOptions
SuggestOptions: Object
Type declaration
Name	Type	Description
bounds?	LngLatBounds	-
center?	LngLat	-
countries?	string	Deprecated
highlight?	boolean	-
limit?	number	-
localOnly?	number	-
span?	LngLat	-
text	string	-
type?	DeprecatedGeoSuggestType	Deprecated use types instead
types?	GeoSuggestType[]	-
SuggestResponse
SuggestResponse: SuggestResponseItem[]
SuggestResponseItem
SuggestResponseItem: Object
Type declaration
Name	Type	Description
address?	{ component?: { kind: string[] ; name: string }[] ; formattedAddress?: string }	Object's address.
address.component?	{ kind: string[] ; name: string }[]	Address components.
address.formattedAddress?	string	Object's address.
distance?	Distance	Distance to the object in meters
subtitle?	TextWithHighlight	Human-readable object subtitle with matching highlighting
tags?	string[]	Object tags. Possible values: business, street, metro, district, locality, area, province, country, hydro, railway, station, route, vegetation, airport, other, house
title	TextWithHighlight	Human-readable object title with matching highlighting
type?	DeprecatedObjectType	Deprecated Use tags instead
uri?	string	Additional object information that can be used in a Geocoder HTTP API request.
value	string	Deprecated Use uri instead
TouchDomEventHandler
TouchDomEventHandler: (`object`: DomEventHandlerObject, `event`: TouchDomEvent) => void
Type declaration
(object, event): void

Parameters
Name	Type
object	DomEventHandlerObject
event	TouchDomEvent
Returns
void

VectorCustomization
VectorCustomization: CustomizationConfig
Deprecated

Use Customization instead

VectorCustomizationElements
VectorCustomizationElements: CustomizationElements
Deprecated

Use CustomizationElements instead

VectorCustomizationItem
VectorCustomizationItem: CustomizationItem
Deprecated

Use CustomizationItem instead

VectorCustomizationTypes
VectorCustomizationTypes: CustomizationTypes
Deprecated

Use CustomizationTypes instead

VectorDataSourcePriority
VectorDataSourcePriority: "low" | "medium" | "high"
VectorObjectsCollisionPriority
VectorObjectsCollisionPriority: "low" | "medium" | "high" | "ultra"
VectorTileSize
VectorTileSize: "X1" | "X4" | "X16"
YMapBoundsLocation
YMapBoundsLocation: Object
Calculate the center and zoom by specifying the coordinates of the top left and bottom right corners of the map.
In this case, the center of the map will be in the center of the rectangle described at the given coordinates.
If the map have an aspect ratio different from this rectangle, the rectangle will be inscribed in height and the map will be centered in width.

map.update({
    location: {bounds: [[-0.118092, 51.509865], [-0.118092, 51.509865]]}
});
Type declaration
Name	Type
bounds	LngLatBounds
YMapCameraRequest
YMapCameraRequest: YMapCamera & {
	duration?: number;
	easing?: EasingFunctionDescription 
}
Describes how to change current camera position. Change can be instantaneous or animated if duration property is set.

map.update({camera: {
     tilt: 45 * (Math.PI / 180), // 45 degrees
     azimuth: 30 * (Math.PI / 180) // 30 degrees
     duration: 200, // Animation of moving camera will take 200 milliseconds
     easing: 'ease-in-out'
 }});
YMapCenterLocation
YMapCenterLocation: Object
Sets map center. In this case, the zoom of the map remains unchanged.

map.update({
  location: {center: [-0.118092, 51.509865]}
});
Type declaration
Name	Type
center	LngLat
YMapCenterZoomLocation
YMapCenterZoomLocation: YMapCenterLocation & YMapZoomLocation
Sets map center and zoom. Combination of YMapCenterLocation and YMapZoomLocation

map.update({
 location: {center: [-0.118092, 51.509865], zoom: 10}
});
YMapContextProviderProps
YMapContextProviderProps<T\>: Object
YMapContextProvider props

Type parameters
Name
T
Type declaration
Name	Type	Description
context	Context<T>	Context that will receive the provided value
value	T	Value to be provided in the context.
YMapControlButtonProps
YMapControlButtonProps: YMapControlCommonButtonProps
YMapControlContext
YMapControlContext: Object
Type declaration
Name	Type
position	[ComputedVerticalPosition, ComputedHorizontalPosition, Orientation]
YMapControlProps
YMapControlProps: Object
YMapControl props

Type declaration
Name	Type	Description
transparent?	boolean	Makes the control transparent by removing background color and shadows
YMapControlsProps
YMapControlsProps: Object
YMapControls props

Type declaration
Name	Type	Description
orientation?	Orientation	Controls orientation.
position	Position	Controls position.
YMapCopyrightsPosition
YMapCopyrightsPosition: "top left" | "top right" | "bottom left" | "bottom right"
Copyrights position on the map container. By default, 'bottom right'.
For example, 'top left' or 'bottom right'

const map = new ymaps3.YMap(document.getElementById('map-root'), {
 copyrightsPosition: 'top left'
});
YMapDefaultFeaturesLayerProps
YMapDefaultFeaturesLayerProps: Object
YMapDefaultFeaturesLayer props

Type declaration
Name	Type	Description
source?	string	Name for source
visible?	boolean	Should show layer. Default is true
zIndex?	number	Layer z-index
YMapDefaultSchemeLayerProps
YMapDefaultSchemeLayerProps: Object
YMapDefaultSchemeLayer props

Type declaration
Name	Type	Description
clampMapZoom?	boolean	Allow to clamp map zoom. If you want the layer to not lock zoom when it reaches its maximum value, you can set this field to false. This may be necessary, for example, when your own layers are working at scales greater than 21.
const defaultSchemeLayer = new YMapDefaultSchemeLayer({clampMapZoom: false}); map.addChild(defaultSchemeLayer);
See example https://yandex.ru/dev/jsapi30/doc/ru/examples/cases/over-zoom Default
true
customization?	Customization	Tiles customization.
layers?	Partial<Record<YMapDefaultSchemeLayerType, Partial<YMapLayerProps>>>	Layers parameters
source?	string	Name for source
theme?	"dark" | "light"	Theme applied to the scheme Deprecated use YMapProps.theme prop in YMap instead
visible?	boolean	Should show layers Deprecated use YMapDefaultSchemeLayerProps.layers instead
YMapFeatureDataSourceProps
YMapFeatureDataSourceProps: Object
YMapFeatureDataSource props

Type declaration
Name	Type	Description
dynamic?	boolean	Whether to optimize this source for frequent data updates
id	string	Data source id
YMapFeatureProps
YMapFeatureProps: {
	disableRoundCoordinates?: boolean;
	geometry: Geometry;
	hideOutsideViewport?: HideOutsideRule;
	id?: string;
	properties?: Record<string, unknown>;
	source?: string;
	style?: DrawingStyle 
} & DraggableProps<YMapFeatureEventHandler> & BlockingProps & FeatureClickEvents & FeatureMouseEvents
YMapFeature props

YMapLayerProps
YMapLayerProps: Object
YMapLayer props

Type declaration
Name	Type	Description
grouppedWith?	string	Layer id to control order in parent group
id?	string	Layer id
implementation?	LayerImplementationClasses	Method, allows you to define your own implementation of the layer
options?	{ raster?: RasterLayerOptions }	Layer options
options.raster?	RasterLayerOptions	-
source?	string	Layer source
type	string	Layer type. For tile data sources should use 'ground'
zIndex?	number	Layer z-index to control order. Default is 1500
YMapListenerProps
YMapListenerProps: DomEventsProps | NullablePartial<MapEvents> | NullablePartial<BehaviorEvents>
YMapLocationRequest
YMapLocationRequest: YMapBoundsLocation | YMapCenterLocation | YMapZoomLocation | YMapCenterZoomLocation & {
	duration?: number;
	easing?: EasingFunctionDescription 
}
Describes how to change current map location. Change can be instantaneous or animated if duration property is set.

map.update({
 location: {
     center: [-0.118092, 51.509865], // Center of the map
     zoom: 10, // Zoom level
     duration: 200, // Animation of moving map will take 200 milliseconds
     easing: 'ease-in-out' // Animation easing function
 }
});
or just change center of the map

map.update({
 location: {
    center: [-0.118092, 51.509865], // Center of the map
    duration: 200, // Animation of moving map will take 200 milliseconds
    easing: 'linear' // Animation easing function
 }
})';
YMapMarkerEventHandler
YMapMarkerEventHandler: (`coordinates`: LngLat) => void | false
Type declaration
(coordinates): void | false

YMapMarker events handler

Parameters
Name	Type
coordinates	LngLat
Returns
void | false

YMapMarkerProps
YMapMarkerProps: {
	coordinates: LngLat;
	disableRoundCoordinates?: boolean;
	hideOutsideViewport?: HideOutsideRule;
	id?: string;
	properties?: Record<string, unknown>;
	source?: string;
	zIndex?: number 
} & DraggableProps<YMapMarkerEventHandler> & BlockingProps & FeatureClickEvents & FeatureMouseEvents
YMapMarker props

YMapProps
YMapProps: Object
Map settings. Allow to set map mode, behaviors, margin, zoom rounding, zoom range, restrict map area, theme and other settings.

const map = new YMap(document.getElementById('map-root'), {
   className: 'custom-map',
   location: {center: [-0.118092, 51.509865], zoom: 10},
   camera: {tilt: 45 * (Math.PI / 180), azimuth: 30 * (Math.PI / 180)}
   mode: 'raster',
   behaviors: ['drag', 'scrollZoom', 'dblClick', 'mouseRotate', 'mouseTilt'],
   margin: [0, 100, 0, 0],
   theme: 'light'
});
But required only location prop.

const map = new YMap(document.getElementById('map-root'), {
  location: {center: [-0.118092, 51.509865], zoom: 10}
});
Type declaration
Name	Type	Description
behaviors?	BehaviorType[]	Active behaviors
camera?	YMapCameraRequest	Initial camera or request to change camera with duration
className?	string	Map container css class name
config?	Config	Other configs
copyrightsPosition?	YMapCopyrightsPosition	Position of copyright on the page. Default is 'bottom right'
hotspotsStrategy?	"forViewport" | "forPointerPosition"	Strategy for fetching hotspots, for whole viewport or for tiles that pointer is hovering at
location	YMapLocationRequest	Initial location or request to change location with duration
margin?	Margin	Map margins
mode?	MapMode	Map mode, 'auto' (default. Show raster tiles while vector tiles are loading), 'raster' or 'vector' (without raster preloading).
projection?	Projection	Projection used in map
restrictMapArea?	LngLatBounds | false	Sets the map view area so that the user cannot move outside of this area.
showScaleInCopyrights?	boolean	Show the map scale next to copyright
theme?	YMapTheme	Theme applied to the scheme
worldOptions?	WorldOptions	Whether to repeat the world in X and Y
zoomRange?	ZoomRange	Restrict min and max map zoom
zoomRounding?	ZoomRounding	Set rounding for zoom. If auto is selected, zoom will be snap for raster and smooth for vector MapMode. Default is auto.
zoomStrategy?	ZoomStrategy	Zoom strategy describes if map center is bound to the zoom point or not
YMapScaleControlProps
YMapScaleControlProps: Object
Properties for YMapScaleControl

Type declaration
Name	Type	Description
maxWidth?	number	Maximum width of scale line in pixels
unit?	UnitType	Units of measurement for the scale line
YMapTheme
YMapTheme: "light" | "dark"
Map theme. Affects the colors of the map controls and background.

const map = new ymaps3.YMap({
   location: {center: [55.751574, 37.573856], zoom: 9},
   theme: 'dark'
});
YMapThemeContext
YMapThemeContext: Object
Type declaration
Name	Type
theme	YMapTheme
YMapType
YMapType: keyof typeof MAP_TYPES
Selects one of predefined map style modes optimized for particular use case. The following values are supported:

map - basic map (by default)
future-map - the base map with the new design
driving - automobile navigation map
transit - public transport map
admin - administrative map
YMapTypeContext
YMapTypeContext: Object
Type declaration
Name	Type
type?	YMapType
YMapZoomLocation
YMapZoomLocation: Object
Sets map zoom. In this case, the center of the map remains unchanged.

map.update({
   location: {zoom: 10}
});
Type declaration
Name	Type
zoom	number
ZoomRounding
ZoomRounding: "snap" | "smooth" | "auto"
Set rounding for zoom.
If auto is selected, zoom will be snap for raster and smooth for vector MapMode.
Default is auto.

ZoomStrategy
ZoomStrategy: "zoomToCenter" | "zoomToPointer"
Variables
ControlContext
const ControlContext: Context<YMapControlContext>
ThemeContext
const ThemeContext: Context<YMapThemeContext>
TypeContext
const TypeContext: Context<YMapTypeContext>
geolocation
const geolocation: Object
Type declaration
Name	Type
getPosition	typeof getPosition
optionsKeyVuefy
const optionsKeyVuefy: unique symbol
overrideKeyReactify
const overrideKeyReactify: unique symbol
Key is used in reactify wrapper, to define custom implementations for react ymaps3.YMapEntity entities

type YMapSomeClassProps = {
    id: string;
};
export class YMapSomeClass extends ymaps3.YMapComplexEntity<YMapSomeClassProps> {
 static [ymaps3.overrideKeyReactify] = YMapSomeClassReactifyOverride;
 //...
}
and

export const YMapSomeClassReactifyOverride = (
  YMapSomeClassI, // it is same YMapSomeClass
  {reactify, React}
) => {
  const YMapSomeClassReactified = reactify.entity(YMapSomeClassI); // Standard reactivation method
    const YMapSomeClassR = React.forwardRef((props, ref) => {
      return (<>
        <YMapSomeClassReactified {...props} ref={ref} ... />
      </>);
    })
  return YMapSomeClassR;
}
and in the end app

import {YMapSomeClass} from './some-class';
import React from 'react';
import ReactDOM from 'react-dom';
// ...
const ymaps3React = await ymaps3.import('@yandex/ymaps3-reactify');
const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);
const {YMapSomeClass as YMapSomeClassR} = reactify.module({YMapSomeClass});

function App() {
    return <YMapSomeClassR id="some_id"/>;
}
overrideKeyVuefy
const overrideKeyVuefy: unique symbol
projections
const projections: Object
Deprecated

Use ymaps3 packages instead

Type declaration
Name	Type	Description
sphericalMercator	projections_.WebMercator	Deprecated Use Web Mercator package instead.
strictMode
strictMode: boolean
Toggle this to enable/disable strict mode.

yandexMaps
const yandexMaps: YandexMaps
Functions
fetchConfig
fetchConfig(options, config?): Promise<Config>

Requests config which is necessary for a map construction

Parameters
Name	Type	Description
options	FetchConfigOptions	Request options
config?	Config	Current config
Returns
Promise<Config>

Config for map construction

getDefaultConfig
getDefaultConfig(): Config

Returns default config object.

ymaps3.getDefaultConfig().setApikeys({suggest: "YOUR_SUGGEST_API_KEY"})`.
Returns
Config

route
route(options, config?): Promise<BaseRouteResponse[]>

Parameters
Name	Type
options	RouteOptions
config?	Config
Returns
Promise<BaseRouteResponse[]>

search
search(options, config?): Promise<SearchResponse>

Static function to work with Search API.

Before using this function it is required to set apikey for Search API
using ymaps3.getDefaultConfig().setApikeys({search: "YOUR_SEARCH_API_KEY"}).
You can get the key in the Developer's Dashboard.

Parameters
Name	Type	Description
options	SearchOptions	Request options
config?	Config	Current config
Returns
Promise<SearchResponse>

suggest
suggest(options, config?): Promise<SuggestResponse>

Static function to work with Suggest API.

Before using this function it is required to set apikey for Suggest API
using ymaps3.getDefaultConfig().setApikeys({suggest: "YOUR_SUGGEST_API_KEY"}).
You can get the key in the Developer's Dashboard.

Parameters
Name	Type	Description
options	SuggestOptions	Request options
config?	Config	Current config
Returns
Promise<SuggestResponse>

useDomContext
useDomContext(entity, element, container): DomDetach

Hook for providing DOM context in entity

Parameters
Name	Type	Description
entity	GenericComplexEntity<unknown, {}, GenericRootEntity<unknown, {}>>	Entity to provide the DomContext
element	Element	DOM element to attach
container	null | Element	DOM element to provide to descendants in new DomContext
Returns
DomDetach

Function that detaches the DOM element and DomContext from the entity

Module: <internal>
Type Aliases
CommonDetails
CommonDetails: Pick<MapDomEvent, "type" | "shiftKey" | "altKey" | "metaKey" | "ctrlKey">
ComposeTileUrlFunction
ComposeTileUrlFunction: (`x`: number, `y`: number, `z`: number, `scale`: number, `signal`: AbortSignal) => string
Type declaration
(x, y, z, scale, signal): string

Parameters
Name	Type
x	number
y	number
z	number
scale	number
signal	AbortSignal
Returns
string

ComputedHorizontalPosition
ComputedHorizontalPosition: "left" | "center" | "right"
ComputedVerticalPosition
ComputedVerticalPosition: "top" | "center" | "bottom"
ContextWatcherFn
ContextWatcherFn: () => void
Type declaration
(): void

Returns
void

CustomReactify
CustomReactify<TEntity,
 TResult\>: (`ctor`: EntityConstructor<TEntity>, `params`: {
	React: typeof TReact;
	ReactDOM: typeof TReactDOM;
	ReactParent: typeof ReactParent;
	reactify: {
		context: <TContext>(`context?`: TContext) => TReact.Context<unknown>;
		module: ReactifyModule;
		entity: <T>(...`args`: [ctor: T, displayName?: string]) => T extends Overrided<T, TResult> ? TResult : ForwardRefExoticComponent<PropsWithoutRef<PropsWithChildren<EntityProps<InstanceType<T>>>> & RefAttributes<undefined | InstanceType<T>>> 
	} 
}) => TResult
Type parameters
Name	Type
TEntity	extends GenericEntity<unknown>
TResult	TResult
Type declaration
(ctor, params): TResult

Parameters
Name	Type
ctor	EntityConstructor<TEntity>
params	Object
params.React	typeof TReact
params.ReactDOM	typeof TReactDOM
params.ReactParent	typeof ReactParent
params.reactify	Object
params.reactify.context	<TContext>(context?: TContext) => TReact.Context<unknown>
params.reactify.module	ReactifyModule
params.reactify.entity	<T>(...args: [ctor: T, displayName?: string]) => T extends Overrided<T, TResult> ? TResult : ForwardRefExoticComponent<PropsWithoutRef<PropsWithChildren<EntityProps<InstanceType<T>>>> & RefAttributes<undefined | InstanceType<T>>>
Returns
TResult

Customization
Customization: CustomizationConfig | CustomizationOptions
CustomizationConfig
CustomizationConfig: CustomizationItem[]
CustomizationElements
CustomizationElements: "geometry" | "geometry.fill" | "geometry.fill.pattern" | "geometry.outline" | "label" | "label.icon" | "label.text" | "label.text.fill" | "label.text.outline"
CustomizationItem
CustomizationItem: Object
Type declaration
Name	Type
elements?	CustomizationElements | CustomizationElements[]
stylers?	CustomizationStyler | CustomizationStyler[]
tags?	{ all?: string | string[] ; any?: string | string[] ; none?: string | string[] } | string
types?	CustomizationTypes | CustomizationTypes[]
CustomizationOptions
CustomizationOptions: Object
Type declaration
Name	Type
render-3d?	"off"
style	CustomizationConfig
CustomizationStyler
CustomizationStyler: Object
Type declaration
Name	Type
color?	string
hue?	string
lightness?	number
opacity?	number
saturation?	number
scale?	number
secondary-color?	string
tertiary-color?	string
visibility?	"off"
zoom?	number | [number, number]
CustomizationTypes
CustomizationTypes: "point" | "polyline" | "polygon"
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps & {
	id: string 
}
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps
DefaultProps
DefaultProps: typeof defaultProps & {
	id: string 
}
DeprecatedGeoSuggestType
DeprecatedGeoSuggestType: "all" | "toponyms" | "addresses" | "organizations"
DeprecatedObjectType
DeprecatedObjectType: "unknown" | "toponym" | "business" | "transit"
Distance
Distance: Object
Type declaration
Name	Type
text	string
value	number
DomEventsProps
DomEventsProps: Partial<DomEvents> & {
	layer?: string 
}
EntityConstructor
EntityConstructor<TEntity\>: (...`args`: any[]) => TEntity
Type parameters
Name	Type
TEntity	extends GenericEntity<unknown>
Type declaration
(...args)

Parameters
Name	Type
...args	any[]
EntityProps
EntityProps<T\>: T extends GenericEntity<infer P> ? P : never
Type parameters
Name	Type
T	extends GenericEntity<unknown>
FetchHotspotsFunction
FetchHotspotsFunction: (`x`: number, `y`: number, `z`: number, `signal`: AbortSignal) => Promise<Hotspot[]>
Type declaration
(x, y, z, signal): Promise<Hotspot[]>

Provides hotspots for given tile coordinates and zoom.

Parameters
Name	Type	Description
x	number	Tile X
y	number	Tile Y
z	number	Tile Z
signal	AbortSignal	is used to abort request in case if hotspots for given tile are no longer required
Returns
Promise<Hotspot[]>

FetchTileFunction
FetchTileFunction: (`x`: number, `y`: number, `z`: number, `scale`: number, `signal`: AbortSignal) => Promise<FetchedCommonTile | FetchedRasterTile>
Type declaration
(x, y, z, scale, signal): Promise<FetchedCommonTile | FetchedRasterTile>

Parameters
Name	Type
x	number
y	number
z	number
scale	number
signal	AbortSignal
Returns
Promise<FetchedCommonTile | FetchedRasterTile>

FillRule
FillRule: "evenodd" | "nonzero"
GenericBounds
GenericBounds<T\>: [T, T]
Generic for rectangle bounded by bottom-left and top-right coordinates

Type parameters
Name
T
GenericGeometry
GenericGeometry<TCoordinates\>: GenericPolygonGeometry<TCoordinates> | GenericMultiPolygonGeometry<TCoordinates> | GenericLineStringGeometry<TCoordinates> | GenericMultiLineStringGeometry<TCoordinates> | GenericPointGeometry<TCoordinates>
Type parameters
Name
TCoordinates
GeoSuggestType
GeoSuggestType: "biz" | "geo" | "street" | "metro" | "district" | "locality" | "area" | "province" | "country" | "house"
Geometry
Geometry: PolygonGeometry | MultiPolygonGeometry | LineStringGeometry | MultiLineStringGeometry | PointGeometry
HandlerEntity
HandlerEntity<TType,
 TEntity\>: Object
Type parameters
Name	Type
TType	extends string
TEntity	TEntity
Type declaration
Name	Type
entity	TEntity
layer	string
source	string
type	TType
HideOutsideRule
HideOutsideRule: {
	extent: number 
} | boolean
Highlight
Highlight: [number, number]
Positions of chars to highlight between

HorizontalPosition
HorizontalPosition: "left" | "right"
Hotspot
Hotspot: WorldHotspot | RenderedHotspot
IndoorPlanType
IndoorPlanType: "indoorPlansChanged"
LayerImplementationClassesProps
LayerImplementationClassesProps<Mode\>: Object
Type parameters
Name	Type
Mode	extends "raster" | "vector" = "raster" | "vector"
Type declaration
Name	Type
effectiveMode	Mode
source	string
type	string
LineStringGeometry
LineStringGeometry: GenericLineStringGeometry<LngLat>
Location
Location: Required<YMapLocation>
MapDomEvent
MapDomEvent: MouseEvent | PointerEvent | TouchEvent
MapEventHandler
MapEventHandler<TObject\>: (`object`: TObject) => void
Type parameters
Name
TObject
Type declaration
(object): void

Parameters
Name	Type
object	TObject
Returns
void

MouseEventDetails
MouseEventDetails: Pick<MouseEvent, "button" | "buttons"> & CommonDetails
MultiLineStringGeometry
MultiLineStringGeometry: GenericMultiLineStringGeometry<LngLat>
MultiPolygonGeometry
MultiPolygonGeometry: GenericMultiPolygonGeometry<LngLat>
Orientation
Orientation: "horizontal" | "vertical"
Overrided
Overrided<TCtor,
 TReactResult\>: Object
Type parameters
Name	Type
TCtor	extends EntityConstructor<GenericEntity<unknown>>
TReactResult	TReactResult
Type declaration
Name	Type
[overrideKeyReactify]	CustomReactify<InstanceType<TCtor>, TReactResult>
Palette
Palette: PaletteEntry[]
PointGeometry
PointGeometry: GenericPointGeometry<LngLat>
PointerEventDetails
PointerEventDetails: Pick<PointerEvent, "pointerId" | "button" | "buttons" | "pointerType"> & CommonDetails
PolygonGeometry
PolygonGeometry: GenericPolygonGeometry<LngLat>
Position
Position: VerticalPosition | HorizontalPosition | \`${VerticalPosition} ${HorizontalPosition}\` | \`${HorizontalPosition} ${VerticalPosition}\`
Describes controls position.

Projection
Projection: GenericProjection<LngLat>
RefInstance
RefInstance<TEntity\>: React.MutableRefObject<TEntity | undefined>
Type parameters
Name	Type
TEntity	extends GenericEntity<unknown>
Stroke
Stroke: StrokeStyle[]
TextWithHighlight
TextWithHighlight: Object
Type declaration
Name	Type
hl	Highlight[]
text	string
TouchEventDetails
TouchEventDetails: CommonDetails & {
	touches: number[] 
}
UnitType
UnitType: "imperial" | "metric" | "nautical"
Types of measurement units that scale control can display.

VerticalPosition
VerticalPosition: "top" | "bottom"
WithDefaults
WithDefaults<Props,
 DefaultProps\>: Props & { [K in keyof DefaultProps]: K extends keyof Props ? NonNullable<Props[K]\> : never }
Type parameters
Name	Type
Props	Props
DefaultProps	extends Partial<Props>
YMapCamera
YMapCamera: Object
Observer camera position

Type declaration
Name	Type	Description
azimuth?	number	Map rotation in radians. Can take values from -Math.PI to Math.PI
tilt?	number	Map tilt in radians. Can take values from 0 to 50 degrees (degrees * (Math.PI / 180))
YMapControlCommonButtonProps
YMapControlCommonButtonProps: Object
Properties for YMapControlCommonButton

const button = new YMapControlCommonButton({
  text: 'Click me!',
  disabled: false,
  color: 'black',
  background: 'white',
  onClick: () => {
     console.log('Button clicked');
  }
});
Type declaration
Name	Type	Description
background?	string	Background color
color?	string	Text color
disabled?	boolean	Should be disabled
element?	HTMLElement	HTML element
onClick?	() => void	On click handler
text?	string	Text content
YMapDefaultSchemeLayerType
YMapDefaultSchemeLayerType: "ground" | "buildings" | "icons" | "labels"
Types of underlay layers available in the default scheme.
Each layer is displayed on the map according to its zIndex.
By default, layers are displayed in the following order:

ground
buildings
icons
labels
See

https://yandex.ru/dev/jsapi30/doc/en/dg/concepts/general#source-prepared

YMapFeatureEventHandler
YMapFeatureEventHandler: (`coordinates`: Geometry["coordinates"]) => void | false
Type declaration
(coordinates): void | false

Feature drag event handler.

function onDragEvent(type, coordinates) => {
   console.log('Event:', type, coordinates);
};
const feature = new YMapFeature({
  geometry: {...},
  draggable: true,
  onDragStart: onDragEvent.bind(null, 'dragStart'),
  onDragMove: onDragEvent.bind(null, 'dragMove'),
  onDragEnd: onDragEvent.bind(null, 'dragEnd'),
});
Parameters
Name	Type
coordinates	Geometry["coordinates"]
Returns
void | false

YMapLocation
YMapLocation: YMapCenterZoomLocation & Partial<YMapBoundsLocation>
Union type for describing the position of the map through the center and zoom or through the bounds of the map

YandexMaps
YandexMaps: Object
Type declaration
Name	Type
getLink	(map: YMap) => string
open	(map: YMap) => void
Variables
MAP_TYPES
const MAP\_TYPES: Object
Type declaration
Name	Type
admin	string
driving	string
future-map	string
map	string
transit	string
ReactParent
ReactParent: React.Context<[ReactParent] | undefined>
ReactParent
ReactParent: Context<undefined | [ReactParent]>
defaultProps
const defaultProps: Readonly<{
	behaviors: string[];
	camera: {
		azimuth: number;
		tilt: number 
	};
	className: "";
	config: Config;
	copyrights: true;
	copyrightsPosition: "bottom right";
	hotspotsStrategy: "forViewport" | "forPointerPosition";
	margin: Margin | undefined;
	mode: "auto";
	projection: Projection;
	restrictMapArea: false;
	showScaleInCopyrights: false;
	theme: "light";
	worldOptions: {
		cycledX: boolean;
		cycledY: boolean 
	};
	zoomRange: ZoomRange;
	zoomRounding: "auto";
	zoomStrategy: "zoomToPointer" 
}>
defaultProps
const defaultProps: Readonly<{
	source: "ymaps3x0-default-feature";
	visible: true 
}>
defaultProps
const defaultProps: Object
Type declaration
Name	Type	Description
clampMapZoom	boolean	-
layers	{ buildings: { zIndex: number } ; ground: { zIndex: number } ; icons: { zIndex: number } ; labels: { zIndex: number } }	-
layers.buildings	{ zIndex: number }	-
layers.buildings.zIndex	number	-
layers.ground	{ zIndex: number }	-
layers.ground.zIndex	number	-
layers.icons	{ zIndex: number }	-
layers.icons.zIndex	number	-
layers.labels	{ zIndex: number }	-
layers.labels.zIndex	number	-
layersInfo	Record<YMapDefaultSchemeLayerType, { type: string ; zIndex: number }>	Deprecated use DefaultProps.layers instead
source	string	-
visible	boolean	-
defaultProps
const defaultProps: Readonly<{
	dynamic: true 
}>
defaultProps
const defaultProps: Readonly<{
	zIndex: 1500 
}>
defaultProps
const defaultProps: Readonly<{
	blockBehaviors: false;
	blockEvents: false;
	draggable: false;
	hideOutsideViewport: false;
	mapFollowsOnDrag: false;
	source: "ymaps3x0-default-feature";
	zIndex: 0 
}>
defaultProps
const defaultProps: Readonly<{
	transparent: false 
}>
defaultProps
const defaultProps: Object
Type declaration
Name	Type
tagName	string
defaultProps
const defaultProps: Readonly<{
	maxWidth: 74;
	unit: "metric" 
}>
defaultProps
const defaultProps: Readonly<{
	source: "ymaps3x0-default-feature" 
}>
Functions
getPosition
getPosition(options?, config?): Promise<{ accuracy?: number ; coords: LngLat }>

Parameters
Name	Type
options?	PositionOptions
config?	Config
Returns
Promise<{ accuracy?: number ; coords: LngLat }>