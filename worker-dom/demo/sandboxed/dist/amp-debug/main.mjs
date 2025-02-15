const OffscreenCanvasProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(8 /* OFFSCREEN_CANVAS_INSTANCE */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodeContext.getNode(targetIndex);
        if (target) {
          const offscreen = target.transferControlToOffscreen();
          workerContext.messageToWorker({
            [12 /* type */]: 9 /* OFFSCREEN_CANVAS_INSTANCE */,
            [13 /* target */]: [target._index_],
            [38 /* data */]: offscreen // Object, an OffscreenCanvas
          }, [offscreen]);
        } else {
          console.error(`'OFFSCREEN_CANVAS_INSTANCE': getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 2 /* End */;
    },
    print(mutations, startPosition, target) {
      return {
        type: 'OFFSCREEN_CANVAS_INSTANCE',
        target,
        allowedExecution
      };
    }
  };
};

/**
 * Returns true if the mutation type can cause a user-visible change to the DOM.
 * @param type
 */
const isUserVisibleMutation = type => {
  switch (type) {
    case 4 /* EVENT_SUBSCRIPTION */:
    case 5 /* GET_BOUNDING_CLIENT_RECT */:
    case 6 /* LONG_TASK_START */:
    case 7 /* LONG_TASK_END */:
    case 12 /* STORAGE */:
    case 8 /* OFFSCREEN_CANVAS_INSTANCE */:
    case 13 /* FUNCTION_CALL */:
      return false;
    default:
      return true;
  }
};
const DefaultAllowedMutations = [0 /* ATTRIBUTES */, 1 /* CHARACTER_DATA */, 2 /* CHILD_LIST */, 3 /* PROPERTIES */, 4 /* EVENT_SUBSCRIPTION */, 5 /* GET_BOUNDING_CLIENT_RECT */, 6 /* LONG_TASK_START */, 7 /* LONG_TASK_END */, 8 /* OFFSCREEN_CANVAS_INSTANCE */, 9 /* OBJECT_MUTATION */, 10 /* OBJECT_CREATION */, 11 /* IMAGE_BITMAP_INSTANCE */, 12 /* STORAGE */, 13 /* FUNCTION_CALL */, 14 /* SCROLL_INTO_VIEW */];
const ReadableMutationType = {
  0: 'ATTRIBUTES',
  1: 'CHARACTER_DATA',
  2: 'CHILD_LIST',
  3: 'PROPERTIES',
  4: 'EVENT_SUBSCRIPTION',
  5: 'GET_BOUNDING_CLIENT_RECT',
  6: 'LONG_TASK_START',
  7: 'LONG_TASK_END',
  8: 'OFFSCREEN_CANVAS_INSTANCE',
  9: 'OBJECT_MUTATION',
  10: 'OBJECT_CREATION',
  11: 'IMAGE_BITMAP_INSTANCE',
  12: 'STORAGE',
  13: 'FUNCTION_INVOCATION',
  14: 'SCROLL_INTO_VIEW'
};

const ADD_EVENT_SUBSCRIPTION_LENGTH = 6;
const REMOVE_EVENT_SUBSCRIPTION_LENGTH = 2;

/**
 * IE11 doesn't support NodeList.prototype.forEach
 * https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
 * @param list NodeList to iterate over
 * @param callback method to call with each node
 */
const nodeListEach = (list, callback) => Array.prototype.forEach.call(list, callback);
const BASE_ELEMENT_INDEX = 1;
class NodeContext {
  /**
   * Called when initializing a Worker, ensures the nodes in baseElement are
   * known for transmission into the Worker and future mutation events from the
   * Worker.
   * @param baseElement Element that will be controlled by a Worker
   */
  constructor(stringContext, baseElement) {
    this.baseElement = void 0;
    this.stringContext = void 0;
    this.count = void 0;
    this.nodes = void 0;
    this.createNodes = (buffer, sanitizer) => {
      const nodeBuffer = new Uint16Array(buffer);
      const nodeBufferLength = nodeBuffer.length;
      for (let iterator = 0; iterator < nodeBufferLength; iterator += 5 /* End */) {
        let node;
        if (nodeBuffer[iterator + 1 /* NodeType */] === 3 /* TEXT_NODE */) {
          node = document.createTextNode(this.stringContext.get(nodeBuffer[iterator + 3 /* TextContent */]));
        } else if (nodeBuffer[iterator + 1 /* NodeType */] === 8 /* COMMENT_NODE */) {
          node = document.createComment(this.stringContext.get(nodeBuffer[iterator + 3 /* TextContent */]));
        } else if (nodeBuffer[iterator + 1 /* NodeType */] === 11 /* DOCUMENT_FRAGMENT_NODE */) {
          node = document.createDocumentFragment();
        } else {
          const nodeName = this.stringContext.get(nodeBuffer[iterator + 2 /* NodeName */]);
          node = nodeBuffer[iterator + 4 /* Namespace */] !== 0 ? document.createElementNS(this.stringContext.get(nodeBuffer[iterator + 4 /* Namespace */]), nodeName) : document.createElement(nodeName);
          // TODO(KB): Restore Properties
          // skeleton.properties.forEach(property => {
          //   node[`${property.name}`] = property.value;
          // });
          // ((skeleton as TransferrableElement)[TransferrableKeys.childNodes] || []).forEach(childNode => {
          //   if (childNode[TransferrableKeys.transferred] === NumericBoolean.FALSE) {
          //     node.appendChild(this.createNode(childNode as TransferrableNode));
          //   }
          // });
          // If `node` is removed by the sanitizer, don't store it and return null.
          if (sanitizer && !sanitizer.sanitize(node)) {
            continue;
          }
        }
        this.storeNode(node, nodeBuffer[iterator]);
      }
    };
    /**
     * Returns the real DOM Element corresponding to a serialized Element object.
     * @param id
     * @return RenderableElement | null
     */
    this.getNode = id => {
      const node = this.nodes.get(id);
      if (node && node.nodeName === 'BODY') {
        // If the node requested is the "BODY"
        // Then we return the base node this specific <amp-script> comes from.
        // This encapsulates each <amp-script> node.
        return this.baseElement;
      }
      return node;
    };
    /**
     * Store the requested node and all of its children.
     * @param node node to store.
     */
    this.storeNodes = node => {
      this.storeNode(node, ++this.count);
      nodeListEach(node.childNodes, n => this.storeNodes(n));
    };
    this.count = 2;
    this.stringContext = stringContext;
    // The nodes map is populated with two default values pointing to baseElement.
    // These are [document, document.body] from the worker.
    this.nodes = new Map([[BASE_ELEMENT_INDEX, baseElement], [2, baseElement]]);
    this.baseElement = baseElement;
    // To ensure a lookup works correctly from baseElement
    // add an index equal to the background thread document.body.
    baseElement._index_ = 2;
    // Lastly, it's important while initializing the document that we store
    // the default nodes present in the server rendered document.
    nodeListEach(baseElement.childNodes, n => this.storeNodes(n));
  }
  /**
   * Establish link between DOM `node` and worker-generated identifier `id`.
   *
   * These _shouldn't_ collide between instances of <amp-script> since
   * each element creates it's own pool on both sides of the worker
   * communication bridge.
   * @param node
   * @param id
   */
  storeNode(node, id) {
    node._index_ = id;
    this.nodes.set(id, node);
  }
}

/**
 * Monitoring Nodes attribute changes requires a Mutation Observer.
 * We store the nodes being monitored to avoid creating more than one Observer
 * per Element.
 */
const monitoredNodes = new Map();
/**
 * Instead of a whitelist of elements that need their value tracked, use the existence
 * of a property called value to drive the decision.
 * @param node node to check if values should be tracked.
 * @return boolean if the node should have its value property tracked.
 */
const shouldTrackChanges = node => node && 'value' in node;
/**
 * When a node that has a value needing synced doesn't already have an event listener
 * listening for input values, ensure the value is synced with a default listener.
 * @param worker whom to dispatch value toward.
 * @param node node to listen to value changes on.
 */
const applyDefaultInputListener = (workerContext, node) => {
  if (shouldTrackChanges(node) && node.oninput === null) {
    node.oninput = () => fireValueChange(workerContext, node);
  }
};
/**
 * Use a MutationObserver to capture value changes based on Attribute modification (frequently used by frameworks).
 * @param worker whom to dispatch value toward.
 * @param node node to listen to value changes on.
 */
const sendValueChangeOnAttributeMutation = (workerContext, node) => {
  if (shouldTrackChanges(node) && !monitoredNodes.get(node)) {
    new MutationObserver(mutations => mutations.map(mutation => fireValueChange(workerContext, mutation.target))).observe(node, {
      attributes: true
    });
    monitoredNodes.set(node, true);
  }
};
/**
 * Tell WorkerDOM what the value is for a Node.
 * @param worker whom to dispatch value toward.
 * @param node where to get the value from.
 */
const fireValueChange = (workerContext, node) => workerContext.messageToWorker({
  [12 /* type */]: 4 /* SYNC */,
  [40 /* sync */]: {
    [7 /* index */]: node._index_,
    [21 /* value */]: node.value
  }
});
/**
 * Tell WorkerDOM what the window dimensions are.
 * @param workerContext
 * @param cachedWindowSize
 */
const fireResizeChange = (workerContext, cachedWindowSize) => workerContext.messageToWorker({
  [12 /* type */]: 5 /* RESIZE */,
  [40 /* sync */]: cachedWindowSize
});
/**
 * Convert a TouchList into a TransferrableTouchList
 * @param touchList
 */
const createTransferrableTouchList = touchList => Object.values(touchList).map(touch => [touch.identifier, touch.screenX, touch.screenY, touch.clientX, touch.clientY, touch.pageX, touch.pageY, touch.target._index_]);
const EventSubscriptionProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const knownListeners = [];
  const allowedExecution = config.executorsAllowed.includes(4 /* EVENT_SUBSCRIPTION */);
  let cachedWindowSize = [window.innerWidth, window.innerHeight];
  /**
   * Register an event handler for dispatching events to worker thread
   * @param worker whom to dispatch events toward
   * @param index node index the event comes from (used to dispatchEvent in worker thread).
   * @return eventHandler function consuming event and dispatching to worker thread
   */
  const eventHandler = (index, preventDefault) => event => {
    if (preventDefault) {
      event.preventDefault();
    }
    if (shouldTrackChanges(event.currentTarget)) {
      fireValueChange(workerContext, event.currentTarget);
    } else if (event.type === 'resize') {
      const {
        innerWidth,
        innerHeight
      } = window;
      if (cachedWindowSize[0] === innerWidth && cachedWindowSize[1] === innerHeight) {
        return;
      }
      cachedWindowSize = [window.innerWidth, window.innerHeight];
      fireResizeChange(workerContext, cachedWindowSize);
    }
    workerContext.messageToWorker({
      [12 /* type */]: 1 /* EVENT */,
      [39 /* event */]: {
        [7 /* index */]: index,
        [25 /* bubbles */]: event.bubbles,
        [26 /* cancelable */]: event.cancelable,
        [27 /* cancelBubble */]: event.cancelBubble,
        [28 /* currentTarget */]: [event.currentTarget._index_ || 0],
        [29 /* defaultPrevented */]: event.defaultPrevented,
        [30 /* eventPhase */]: event.eventPhase,
        [31 /* isTrusted */]: event.isTrusted,
        [32 /* returnValue */]: event.returnValue,
        [13 /* target */]: [event.target._index_ || 0],
        [33 /* timeStamp */]: event.timeStamp,
        [12 /* type */]: event.type,
        [35 /* keyCode */]: 'keyCode' in event ? event.keyCode : undefined,
        [60 /* pageX */]: 'pageX' in event ? event.pageX : undefined,
        [61 /* pageY */]: 'pageY' in event ? event.pageY : undefined,
        [65 /* offsetX */]: 'offsetX' in event ? event.offsetX : undefined,
        [66 /* offsetY */]: 'offsetY' in event ? event.offsetY : undefined,
        [62 /* touches */]: 'touches' in event ? createTransferrableTouchList(event.touches) : undefined,
        [63 /* changedTouches */]: 'changedTouches' in event ? createTransferrableTouchList(event.changedTouches) : undefined
      }
    });
  };
  /**
   * If the worker requests to add an event listener to 'change' for something the foreground thread is already listening to,
   * ensure that only a single 'change' event is attached to prevent sending values multiple times.
   * @param target node to change listeners on
   * @param addEvent is this an 'addEvent' or 'removeEvent' change
   * @param mutations Uint16Array for this set of changes
   * @param iterator current location in array to perform this change on
   */
  const processListenerChange = (target, addEvent, mutations, iterator) => {
    const type = strings.get(mutations[iterator]);
    const eventIndex = mutations[iterator + 1 /* Index */];
    if (target === nodeContext.baseElement) {
      if (addEvent) {
        const preventDefault = Boolean(mutations[iterator + 5 /* WorkerDOMPreventDefault */]);
        addEventListener(type, knownListeners[eventIndex] = eventHandler(BASE_ELEMENT_INDEX, preventDefault));
      } else {
        removeEventListener(type, knownListeners[eventIndex]);
      }
      return;
    }
    let inputEventSubscribed = target.oninput !== null;
    const isChangeEvent = type === 'change';
    if (addEvent) {
      if (isChangeEvent) {
        inputEventSubscribed = true;
        target.onchange = null;
      }
      const preventDefault = Boolean(mutations[iterator + 5 /* WorkerDOMPreventDefault */]);
      target.addEventListener(type, knownListeners[eventIndex] = eventHandler(target._index_, preventDefault));
    } else {
      if (isChangeEvent) {
        inputEventSubscribed = false;
      }
      target.removeEventListener(type, knownListeners[eventIndex]);
    }
    if (shouldTrackChanges(target)) {
      if (!inputEventSubscribed) applyDefaultInputListener(workerContext, target);
      sendValueChangeOnAttributeMutation(workerContext, target);
    }
  };
  return {
    execute(mutations, startPosition, allowedMutation) {
      const addEventListenerCount = mutations[startPosition + 3 /* AddEventListenerCount */];
      const removeEventListenerCount = mutations[startPosition + 2 /* RemoveEventListenerCount */];
      const addEventListenersPosition = startPosition + 4 /* Events */ + removeEventListenerCount * REMOVE_EVENT_SUBSCRIPTION_LENGTH;
      const endPosition = startPosition + 4 /* Events */ + addEventListenerCount * ADD_EVENT_SUBSCRIPTION_LENGTH + removeEventListenerCount * REMOVE_EVENT_SUBSCRIPTION_LENGTH;
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodeContext.getNode(targetIndex);
        if (target) {
          let iterator = startPosition + 4 /* Events */;
          while (iterator < endPosition) {
            const isRemoveEvent = iterator <= addEventListenersPosition;
            processListenerChange(target, isRemoveEvent, mutations, iterator);
            iterator += isRemoveEvent ? REMOVE_EVENT_SUBSCRIPTION_LENGTH : ADD_EVENT_SUBSCRIPTION_LENGTH;
          }
        } else {
          console.error(`getNode(${targetIndex}) is null.`);
        }
      }
      return endPosition;
    },
    print(mutations, startPosition) {
      const addEventListenerCount = mutations[startPosition + 3 /* AddEventListenerCount */];
      const removeEventListenerCount = mutations[startPosition + 2 /* RemoveEventListenerCount */];
      const addEventListenersPosition = startPosition + 4 /* Events */ + removeEventListenerCount * REMOVE_EVENT_SUBSCRIPTION_LENGTH;
      const endPosition = startPosition + 4 /* Events */ + addEventListenerCount * ADD_EVENT_SUBSCRIPTION_LENGTH + removeEventListenerCount * REMOVE_EVENT_SUBSCRIPTION_LENGTH;
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodeContext.getNode(targetIndex);
      const removedEventListeners = [];
      const addedEventListeners = [];
      let iterator = startPosition + 4 /* Events */;
      while (iterator < endPosition) {
        const isRemoveEvent = iterator <= addEventListenersPosition;
        const eventList = isRemoveEvent ? addedEventListeners : removedEventListeners;
        eventList.push({
          type: strings.get(mutations[iterator]),
          index: mutations[iterator + 1]
        });
        iterator += isRemoveEvent ? REMOVE_EVENT_SUBSCRIPTION_LENGTH : ADD_EVENT_SUBSCRIPTION_LENGTH;
      }
      return {
        target,
        allowedExecution,
        removedEventListeners,
        addedEventListeners
      };
    }
  };
};

const BoundingClientRectProcessor = (strings, nodes, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(5 /* GET_BOUNDING_CLIENT_RECT */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodes.getNode(targetIndex);
        if (target) {
          const boundingRect = target.getBoundingClientRect();
          workerContext.messageToWorker({
            [12 /* type */]: 6 /* GET_BOUNDING_CLIENT_RECT */,
            [13 /* target */]: [target._index_],
            [38 /* data */]: [boundingRect.top, boundingRect.right, boundingRect.bottom, boundingRect.left, boundingRect.width, boundingRect.height]
          });
        } else {
          console.error(`GET_BOUNDING_CLIENT_RECT: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 2 /* End */;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodes.getNode(targetIndex);
      return {
        type: 'GET_BOUNDING_CLIENT_RECT',
        target,
        allowedExecution
      };
    }
  };
};

const ChildListProcessor = (strings, {
  getNode
}, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(2 /* CHILD_LIST */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      const appendNodeCount = mutations[startPosition + 4 /* AppendedNodeCount */];
      const removeNodeCount = mutations[startPosition + 5 /* RemovedNodeCount */];
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = getNode(targetIndex);
        if (target) {
          if (removeNodeCount > 0) {
            mutations.slice(startPosition + 6 /* Nodes */ + appendNodeCount, startPosition + 6 /* Nodes */ + appendNodeCount + removeNodeCount).forEach(removeId => {
              const node = getNode(removeId);
              if (node) {
                node.remove();
              } else {
                console.error(`CHILD_LIST: getNode(${removeId}) is null.`);
              }
            });
          }
          if (appendNodeCount > 0) {
            mutations.slice(startPosition + 6 /* Nodes */, startPosition + 6 /* Nodes */ + appendNodeCount).forEach(addId => {
              const nextSibling = mutations[startPosition + 2 /* NextSibling */];
              const newNode = getNode(addId);
              if (newNode) {
                // TODO: Handle this case ---
                // Transferred nodes that are not stored were previously removed by the sanitizer.
                target.insertBefore(newNode, nextSibling && getNode(nextSibling) || null);
                applyDefaultInputListener(workerContext, newNode);
                sendValueChangeOnAttributeMutation(workerContext, newNode);
              }
            });
          }
        } else {
          console.error(`CHILD_LIST: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 6 /* End */ + appendNodeCount + removeNodeCount;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = getNode(targetIndex);
      const appendNodeCount = mutations[startPosition + 4 /* AppendedNodeCount */];
      const removeNodeCount = mutations[startPosition + 5 /* RemovedNodeCount */];
      const removedNodes = Array.from(mutations.slice(startPosition + 6 /* Nodes */ + appendNodeCount, startPosition + 6 /* Nodes */ + appendNodeCount + removeNodeCount)).map(index => getNode(index) || index);
      const addedNodes = Array.from(mutations.slice(startPosition + 6 /* Nodes */, startPosition + 6 /* Nodes */ + appendNodeCount)).map(index => getNode(index) || index);
      return {
        target,
        allowedExecution,
        nextSibling: getNode(mutations[startPosition + 2 /* NextSibling */]) || null,
        previousSibling: getNode(mutations[startPosition + 3 /* PreviousSibling */]) || null,
        addedNodes,
        removedNodes
      };
    }
  };
};

const AttributeProcessor = (strings, nodes, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(0 /* ATTRIBUTES */);
  /**
   * @param mutations
   * @param startPosition
   */
  const getValue = (mutations, startPosition) => {
    const value = mutations[startPosition + 4 /* Value */];
    // Value is sent as 0 when it's the default value or removal.
    // Value is sent as index + 1 when it's a valid value.
    return value !== 0 ? strings.get(value - 1) : null;
  };
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodes.getNode(targetIndex);
        const attributeName = strings.get(mutations[startPosition + 2 /* Name */]);
        const value = getValue(mutations, startPosition);
        if (target) {
          if (attributeName != null) {
            if (config.sanitizer) {
              config.sanitizer.setAttribute(target, attributeName, value);
            } else {
              if (value == null) {
                target.removeAttribute(attributeName);
              } else {
                target.setAttribute(attributeName, value);
              }
            }
          }
        } else {
          console.error(`ATTR_LIST: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 5 /* End */;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodes.getNode(targetIndex);
      const attributeName = strings.get(mutations[startPosition + 2 /* Name */]);
      const value = getValue(mutations, startPosition);
      return {
        target,
        allowedExecution,
        attributeName,
        value,
        remove: value == null
      };
    }
  };
};

const CharacterDataProcessor = (strings, nodes, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(1 /* CHARACTER_DATA */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodes.getNode(targetIndex);
        const value = mutations[startPosition + 2 /* Value */];
        if (target) {
          if (value) {
            // Sanitization not necessary for textContent.
            target.textContent = strings.get(value);
          }
        } else {
          console.error(`CHAR_DATA: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 3 /* End */;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodes.getNode(targetIndex);
      return {
        target,
        allowedExecution,
        value: strings.get(mutations[startPosition + 2 /* Value */])
      };
    }
  };
};

const PropertyProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(3 /* PROPERTIES */);
  const getValue = (mutations, startPosition) => {
    const value = mutations[startPosition + 4 /* Value */];
    if (mutations[startPosition + 3 /* IsBoolean */] === 1 /* TRUE */) {
      return value === 1 /* TRUE */;
    }
    if (value !== 0) {
      return strings.get(value);
    }
    return null;
  };
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodeContext.getNode(targetIndex);
        const name = strings.get(mutations[startPosition + 2 /* Name */]);
        const value = getValue(mutations, startPosition);
        if (target) {
          if (name && value != null) {
            if (config.sanitizer) {
              config.sanitizer.setProperty(target, name, String(value));
            } else {
              target[name] = value;
            }
          }
        } else {
          console.error(`PROPERTY: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 5 /* End */;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodeContext.getNode(targetIndex);
      const name = strings.get(mutations[startPosition + 2 /* Name */]);
      const value = getValue(mutations, startPosition);
      return {
        target,
        name,
        value,
        allowedExecution
      };
    }
  };
};

const LongTaskExecutor = (stringContext, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(6 /* LONG_TASK_START */);
  let index = 0;
  let currentResolver;
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation && config.longTask) {
        if (mutations[startPosition] === 6 /* LONG_TASK_START */) {
          index++;
          if (!currentResolver) {
            const newResolver = new Promise(resolve => currentResolver = resolve);
            // One of the worker-dom contracts is that there should not be two
            // LONG_TASK_STARTs in a row without an END in between. In case both exist within
            // the same set of mutations, we need to guard against having a consumers 1st END
            // handler occur after the START handler. If we synchronously called longTask() here it
            // would likely occur due to scheduling of callbacks vs. promise.
            // See: worker-dom/pull/989.
            Promise.resolve().then(() => config.longTask && config.longTask(newResolver));
          }
        } else if (mutations[startPosition] === 7 /* LONG_TASK_END */) {
          index--;
          if (currentResolver && index <= 0) {
            currentResolver();
            currentResolver = null;
            index = 0;
          }
        }
      }
      return startPosition + 2 /* End */;
    },
    print(mutations, startPosition) {
      return {
        type: ReadableMutationType[mutations[startPosition]],
        allowedExecution
      };
    },
    get active() {
      return currentResolver !== null;
    }
  };
};

const f32 = new Float32Array(1);
const u16 = new Uint16Array(f32.buffer);
/**
 * Deserializes TransferrableObjectType arguments.
 * @param buffer Contains mutation with arguments to deserialize.
 * @param offset Start position of arguments in mutations buffer.
 * @param count Number of arguments to deserialize.
 * @param stringContext Strings context.
 * @param nodeContext Nodes context.
 * @param objectContext Objects context
 */
function deserializeTransferrableObject(buffer, offset, count, stringContext, nodeContext, objectContext) {
  const args = [];
  for (let i = 0; i < count; i++) {
    switch (buffer[offset++]) {
      case 1 /* SmallInt */:
        args.push(buffer[offset++]);
        break;
      case 2 /* Float */:
        u16[0] = buffer[offset++];
        u16[1] = buffer[offset++];
        args.push(f32[0]);
        break;
      case 3 /* String */:
        args.push(stringContext.get(buffer[offset++]));
        break;
      case 4 /* Array */:
        const size = buffer[offset++];
        const des = deserializeTransferrableObject(buffer, offset, size, stringContext, nodeContext, objectContext);
        args.push(des.args);
        offset = des.offset;
        break;
      case 5 /* TransferObject */:
        if (!objectContext) {
          throw new Error('objectContext not provided.');
        }
        args.push(objectContext.get(buffer[offset++]));
        break;
      case 6 /* CanvasRenderingContext2D */:
        const canvas = nodeContext.getNode(buffer[offset++]);
        args.push(canvas.getContext('2d'));
        break;
      case 7 /* HTMLElement */:
        args.push(nodeContext.getNode(buffer[offset++]));
        break;
      default:
        throw new Error('Cannot deserialize argument.');
    }
  }
  return {
    args,
    offset
  };
}

const ObjectMutationProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(9 /* OBJECT_MUTATION */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      const functionName = strings.get(mutations[startPosition + 1 /* FunctionName */]);
      const argCount = mutations[startPosition + 2 /* ArgumentCount */];
      const {
        offset: targetOffset,
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 3 /* SerializedTarget */, 1, strings, nodeContext, objectContext);
      const target = deserializedTarget[0];
      const {
        offset: argsOffset,
        args
      } = deserializeTransferrableObject(mutations, targetOffset, argCount, strings, nodeContext, objectContext);
      if (allowedExecution && allowedMutation) {
        if (isSetter(target, functionName)) {
          target[functionName] = args[0];
        } else {
          target[functionName](...args);
        }
      }
      return argsOffset;
    },
    print(mutations, startPosition) {
      const functionName = strings.get(mutations[startPosition + 1 /* FunctionName */]);
      const {
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 3 /* SerializedTarget */, 1, strings, nodeContext, objectContext);
      const target = deserializedTarget[0];
      return {
        type: 'OBJECT_MUTATION',
        target,
        functionName,
        isSetter: isSetter(target, functionName),
        allowedExecution
      };
    }
  };
};
function isSetter(object, name) {
  if (!object) {
    throw new Error(`Property ${name} does not exist on ${object}.`);
  }
  const descriptor = Object.getOwnPropertyDescriptor(object, name);
  if (descriptor !== undefined) {
    return 'set' in descriptor;
  }
  return isSetter(Object.getPrototypeOf(object), name);
}

const ObjectCreationProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(10 /* OBJECT_CREATION */);
  if (!objectContext) {
    throw new Error('objectContext is not defined.');
  }
  return {
    execute(mutations, startPosition, allowedMutation) {
      const functionName = strings.get(mutations[startPosition + 1 /* FunctionName */]);
      const objectId = mutations[startPosition + 2 /* ObjectId */];
      const argCount = mutations[startPosition + 3 /* ArgumentCount */];
      const {
        offset: targetOffset,
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 4 /* SerializedTarget */, 1,
      // argCount
      strings, nodeContext, objectContext);
      const target = deserializedTarget[0];
      const {
        offset: argsOffset,
        args
      } = deserializeTransferrableObject(mutations, targetOffset, argCount, strings, nodeContext, objectContext);
      if (allowedExecution && allowedMutation) {
        if (functionName === 'new') ; else {
          objectContext.store(objectId, target[functionName](...args));
        }
      }
      return argsOffset;
    },
    print(mutations, startPosition) {
      const functionName = strings.get(mutations[startPosition + 1 /* FunctionName */]);
      const objectId = mutations[startPosition + 2 /* ObjectId */];
      const argCount = mutations[startPosition + 3 /* ArgumentCount */];
      const {
        args: deserializedTarget
      } = deserializeTransferrableObject(mutations, startPosition + 4 /* SerializedTarget */, 1,
      // argCount
      strings, nodeContext, objectContext);
      const target = deserializedTarget[0];
      return {
        type: 'OBJECT_CREATION',
        target,
        functionName,
        objectId,
        argCount,
        allowedExecution
      };
    }
  };
};

const ImageBitmapProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(11 /* IMAGE_BITMAP_INSTANCE */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodeContext.getNode(targetIndex);
        if (target) {
          self.createImageBitmap(target).then(imageBitmap => {
            workerContext.messageToWorker({
              [12 /* type */]: 10 /* IMAGE_BITMAP_INSTANCE */,
              [73 /* callIndex */]: mutations[startPosition + 2 /* CallIndex */],
              [38 /* data */]: imageBitmap
            }, [imageBitmap]);
          });
        } else {
          console.error(`IMAGE_BITMAP_INSTANCE: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 3 /* End */;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodeContext.getNode(targetIndex);
      return {
        type: 'IMAGE_BITMAP_INSTANCE',
        target,
        allowedExecution,
        callIndex: mutations[startPosition + 2 /* CallIndex */]
      };
    }
  };
};

const StorageProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(12 /* STORAGE */);
  const get = (location, key) => {
    if (config.sanitizer && location === 2 /* AmpState */) {
      config.sanitizer.getStorage(location, key).then(value => {
        const message = {
          [12 /* type */]: 11 /* GET_STORAGE */,
          [74 /* storageKey */]: key,
          [75 /* storageLocation */]: location,
          [21 /* value */]: value
        };
        workerContext.messageToWorker(message);
      });
    } else {
      console.error(`STORAGE: Sanitizer not found or unsupported location:`, location);
    }
  };
  const set = (location, key, value) => {
    if (config.sanitizer) {
      // TODO: Message worker so AMP.setState() can be Promise-able.
      config.sanitizer.setStorage(location, key, value);
    } else {
      let storage;
      if (location === 0 /* Local */) {
        storage = window.localStorage;
      } else if (location === 1 /* Session */) {
        storage = window.sessionStorage;
      }
      if (storage) {
        if (key == null) {
          if (value == null) {
            storage.clear();
          } else {
            throw new Error('Unexpected storage operation.');
          }
        } else {
          if (value == null) {
            storage.removeItem(key);
          } else {
            storage.setItem(key, value);
          }
        }
      } else {
        console.error(`STORAGE: Unexpected location: "${location}".`);
      }
    }
  };
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const operation = mutations[startPosition + 1 /* Operation */];
        const location = mutations[startPosition + 2 /* Location */];
        const keyIndex = mutations[startPosition + 3 /* Key */];
        const valueIndex = mutations[startPosition + 4 /* Value */];
        // TODO(choumx): Clean up key/value strings (or don't store them in the first place)
        // to avoid leaking memory.
        const key = keyIndex > 0 ? strings.get(keyIndex - 1) : '';
        const value = valueIndex > 0 ? strings.get(valueIndex - 1) : null;
        if (operation === 1 /* GET */) {
          get(location, key);
        } else if (operation === 2 /* SET */) {
          set(location, key, value);
        }
      }
      return startPosition + 5 /* End */;
    },
    print(mutations, startPosition) {
      const operation = mutations[startPosition + 1 /* Operation */];
      const location = mutations[startPosition + 2 /* Location */];
      const keyIndex = mutations[startPosition + 3 /* Key */];
      const valueIndex = mutations[startPosition + 4 /* Value */];
      const key = keyIndex > 0 ? strings.get(keyIndex - 1) : null;
      const value = valueIndex > 0 ? strings.get(valueIndex - 1) : null;
      return {
        type: 'STORAGE',
        operation,
        location,
        key,
        value,
        allowedExecution
      };
    }
  };
};

let fnCallCount = 0;
/**
 * A mapping between each request to callFunction and its Promise.
 */
const promiseMap = {};
/**
 * Each invocation of `ExportedWorker.prototype.callFunction` needs to be registered with a unique index
 * and promise. The index is given to the underlying Worker and returned by it as well. That enables the main-thread to
 * correlate postMessage responses with their original requests and resolve/reject the correct Promise.
 */
function registerPromise() {
  // TS won't realize that the constructor promise assigns the handlers, so we `any` them.
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  // Wraparound to 0 in case someone attempts to register over 9 quadrillion promises.
  if (fnCallCount >= Number.MAX_VALUE) {
    fnCallCount = 0;
  }
  const index = fnCallCount++;
  promiseMap[index] = {
    promise,
    resolve,
    reject
  };
  return {
    promise,
    index
  };
}
const FunctionProcessor = (strings, nodeContext, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(13 /* FUNCTION_CALL */);
  return {
    execute(mutations, startPosition) {
      if (allowedExecution) {
        const status = mutations[startPosition + 1 /* Status */];
        const index = mutations[startPosition + 2 /* Index */];
        const value = mutations[startPosition + 3 /* Value */];
        const parsed = strings.hasIndex(value) ? JSON.parse(strings.get(value)) : undefined;
        if (status === 1 /* RESOLVE */) {
          promiseMap[index].resolve(parsed);
        } else {
          promiseMap[index].reject(parsed);
        }
        delete promiseMap[index];
      }
      return startPosition + 4 /* End */;
    },
    print(mutations, startPosition) {
      const status = mutations[startPosition + 1 /* Status */];
      const index = mutations[startPosition + 2 /* Index */];
      const value = mutations[startPosition + 3 /* Value */];
      return {
        type: 'FUNCTION_INVOCATION',
        status,
        index,
        value: strings.get(value),
        allowedExecution
      };
    }
  };
};

const ScrollIntoViewProcessor = (strings, nodes, workerContext, objectContext, config) => {
  const allowedExecution = config.executorsAllowed.includes(14 /* SCROLL_INTO_VIEW */);
  return {
    execute(mutations, startPosition, allowedMutation) {
      if (allowedExecution && allowedMutation) {
        const targetIndex = mutations[startPosition + 1 /* Target */];
        const target = nodes.getNode(targetIndex);
        if (target) {
          target.scrollIntoView();
        } else {
          console.error(`SCROLL_INTO_VIEW: getNode(${targetIndex}) is null.`);
        }
      }
      return startPosition + 2 /* End */;
    },
    print(mutations, startPosition) {
      const targetIndex = mutations[startPosition + 1 /* Target */];
      const target = nodes.getNode(targetIndex);
      return {
        type: 'SCROLL_INTO_VIEW',
        target,
        allowedExecution
      };
    }
  };
};

class MutatorProcessor {
  /**
   * @param stringContext
   * @param nodeContext
   * @param workerContext
   * @param sanitizer Sanitizer to apply to content if needed.
   */
  constructor(stringContext, nodeContext, workerContext, config, objectContext) {
    this.stringContext = void 0;
    this.nodeContext = void 0;
    this.mutationQueue = [];
    this.pendingMutations = false;
    this.mutationPumpFunction = void 0;
    this.sanitizer = void 0;
    this.executors = void 0;
    /**
     * Apply all stored mutations syncronously. This method works well, but can cause jank if there are too many
     * mutations to apply in a single frame.
     *
     * Investigations in using asyncFlush to resolve are worth considering.
     *
     * @param allowVisibleMutations
     * @return Array of mutation types that were disallowed.
     */
    this.syncFlush = (allowVisibleMutations = true) => {
      const disallowedMutations = [];
      this.mutationQueue.forEach(mutationArray => {
        const length = mutationArray.length;
        let operationStart = 0;
        while (operationStart < length) {
          // TransferrableMutationType is always at position 0.
          const mutationType = mutationArray[operationStart];
          // TODO(worker-dom): Hoist `allow` up to entry point (index.amp.ts) to avoid bundling `isUserVisibleMutation`.
          const allow = allowVisibleMutations || !isUserVisibleMutation(mutationType);
          if (!allow) {
            // TODO(worker-dom): Consider returning the strings from executor.print() for better error messaging.
            disallowedMutations.push(mutationType);
          }
          const executor = this.executors[mutationType];
          {
            console.log(allow ? '' : '[disallowed]', ReadableMutationType[mutationType], executor.print(mutationArray, operationStart));
          }
          operationStart = executor.execute(mutationArray, operationStart, allow);
        }
      });
      this.mutationQueue = [];
      this.pendingMutations = false;
      return disallowedMutations;
    };
    this.stringContext = stringContext;
    this.nodeContext = nodeContext;
    this.sanitizer = config.sanitizer;
    this.mutationPumpFunction = config.mutationPump;
    const args = [stringContext, nodeContext, workerContext, objectContext, config];
    const sharedLongTaskProcessor = LongTaskExecutor.apply(null, args);
    this.executors = {
      [2 /* CHILD_LIST */]: ChildListProcessor.apply(null, args),
      [0 /* ATTRIBUTES */]: AttributeProcessor.apply(null, args),
      [1 /* CHARACTER_DATA */]: CharacterDataProcessor.apply(null, args),
      [3 /* PROPERTIES */]: PropertyProcessor.apply(null, args),
      [4 /* EVENT_SUBSCRIPTION */]: EventSubscriptionProcessor.apply(null, args),
      [5 /* GET_BOUNDING_CLIENT_RECT */]: BoundingClientRectProcessor.apply(null, args),
      [6 /* LONG_TASK_START */]: sharedLongTaskProcessor,
      [7 /* LONG_TASK_END */]: sharedLongTaskProcessor,
      [8 /* OFFSCREEN_CANVAS_INSTANCE */]: OffscreenCanvasProcessor.apply(null, args),
      [9 /* OBJECT_MUTATION */]: ObjectMutationProcessor.apply(null, args),
      [10 /* OBJECT_CREATION */]: ObjectCreationProcessor.apply(null, args),
      [11 /* IMAGE_BITMAP_INSTANCE */]: ImageBitmapProcessor.apply(null, args),
      [12 /* STORAGE */]: StorageProcessor.apply(null, args),
      [13 /* FUNCTION_CALL */]: FunctionProcessor.apply(null, args),
      [14 /* SCROLL_INTO_VIEW */]: ScrollIntoViewProcessor.apply(null, args)
    };
  }
  /**
   * Process MutationRecords from worker thread applying changes to the existing DOM.
   * @param phase Current Phase Worker Thread exists in.
   * @param nodes New nodes to add in the main thread with the incoming mutations.
   * @param stringValues Additional string values to use in decoding messages.
   * @param mutations Changes to apply in both graph shape and content of Elements.
   */
  mutate(phase, nodes, stringValues, mutations) {
    this.stringContext.storeValues(stringValues);
    this.nodeContext.createNodes(nodes, this.sanitizer);
    this.mutationQueue = this.mutationQueue.concat(mutations);
    if (!this.pendingMutations) {
      this.pendingMutations = true;
      this.mutationPumpFunction(this.syncFlush, phase);
    }
  }
}

/**
 * Stores indexed strings that are used in postMessage() calls from the worker.
 */
class StringContext {
  constructor() {
    this.strings = void 0;
    this.strings = [];
  }
  /**
   * Return a string for the specified index.
   * @param index string index to retrieve.
   * @return string in map for the index.
   */
  get(index) {
    return this.strings[index] || '';
  }
  hasIndex(index) {
    return this.strings[index] !== undefined;
  }
  /**
   * Stores a string in mapping and returns the index of the location.
   * @param value string to store
   * @return {number}
   */
  store(value) {
    this.strings.push(value);
    return this.strings.length - 1;
  }
  /**
   * Stores a set of strings.
   * @param values
   */
  storeValues(values) {
    values.forEach(v => this.store(v));
  }
}

function normalizeConfiguration(config) {
  return Object.assign({}, {
    mutationPump: requestAnimationFrame.bind(null),
    executorsAllowed: DefaultAllowedMutations
  }, config);
}

const NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT = [8 /* COMMENT_NODE */, 3 /* TEXT_NODE */];
/**
 * Serializes a DOM element for transport to the worker.
 * @param element
 * @param minimizeString Function for minimizing strings for optimized ferrying across postMessage.
 */
function createHydrateableNode(element, minimizeString, hydrateFilter, workerContext) {
  const filteredChildNodes = [].slice.call(element.childNodes).filter(hydrateFilter);
  const hydrated = {
    [7 /* index */]: element._index_,
    [11 /* transferred */]: 0 /* FALSE */,
    [0 /* nodeType */]: element.nodeType,
    [1 /* localOrNodeName */]: minimizeString(element.localName || element.nodeName),
    [4 /* childNodes */]: filteredChildNodes.map(child => createHydrateableNode(child, minimizeString, hydrateFilter, workerContext)),
    [2 /* attributes */]: [].map.call(element.attributes || [], attribute => [minimizeString(attribute.namespaceURI || 'null'), minimizeString(attribute.name), minimizeString(attribute.value)])
  };
  if (element.namespaceURI != null) {
    hydrated[6 /* namespaceURI */] = minimizeString(element.namespaceURI);
  }
  if (NODES_ALLOWED_TO_TRANSMIT_TEXT_CONTENT.includes(element.nodeType) && element.textContent !== null) {
    hydrated[5 /* textContent */] = minimizeString(element.textContent);
  }
  applyDefaultInputListener(workerContext, element);
  sendValueChangeOnAttributeMutation(workerContext, element);
  return hydrated;
}
/**
 * @param element
 */
function createHydrateableRootNode(element, config, workerContext) {
  const hydrateFilter = config.hydrateFilter || (() => true);
  const strings = [];
  const stringMap = new Map();
  const storeString = value => {
    if (stringMap.has(value)) {
      // Safe to cast since we verified the mapping contains the value.
      return stringMap.get(value);
    }
    const count = strings.length;
    stringMap.set(value, count);
    strings.push(value);
    return count;
  };
  const skeleton = createHydrateableNode(element, storeString, hydrateFilter, workerContext);
  return {
    skeleton,
    strings
  };
}
/**
 * @param element
 */
function createReadableHydrateableRootNode(element, config, workerContext) {
  // "Readable" variant doesn't do any string minimization so we can output it for debugging purposes.
  // Note that this intentionally breaks the type contract of createHydrateableNode() and HydrateableNode.
  return createHydrateableNode(element, value => value, config.hydrateFilter || (() => true), workerContext);
}

/**
 * @fileoverview Converts index-based worker messages to human-readable objects.
 *
 * Requires manual upkeep to keep consistency with messages and enums.
 * This allows us to continue using 'const enum' for enum inlining.
 * @see https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#9.4
 */
/**
 * @param element
 */
const readableHydrateableRootNode = (element, config, workerContext) => readableHydrateableNode(createReadableHydrateableRootNode(element, config, workerContext));
/**
 * @param nodeContext {NodeContext}
 * @param node {TransferredNode}
 */
const readableTransferredNode = (nodeContext, node) => node != null && nodeContext.getNode(node[0 /* Index */]) || node;
/**
 * @param node
 */
function readableHydrateableNode(node) {
  const out = {
    nodeType: node[0 /* nodeType */],
    name: node[1 /* localOrNodeName */],
    attributes: null,
    childNodes: null
  };
  const attributes = node[2 /* attributes */];
  if (attributes) {
    out.attributes = attributes.map(attr => ({
      name: attr[1],
      value: attr[2]
    }));
  }
  const childNodes = node[4 /* childNodes */];
  if (childNodes) {
    out.childNodes = childNodes.map(readableHydrateableNode);
  }
  return out;
}
/**
 * @param message {MessageToWorker}
 */
const isEvent = message => message[12 /* type */] == 1 /* EVENT */;
const isValueSync = message => message[12 /* type */] == 4 /* SYNC */;
const isBoundingClientRect = message => message[12 /* type */] === 6 /* GET_BOUNDING_CLIENT_RECT */;
const isGetStorage = message => message[12 /* type */] === 11 /* GET_STORAGE */;
/**
 * @param nodeContext {NodeContext}
 * @param event {TransferrableEvent}
 */
function readableTransferrableEvent(nodeContext, event) {
  const value = item => {
    if (typeof item === 'number' || typeof item === 'boolean') {
      return item !== undefined ? item : null;
    }
    return item !== undefined && item !== null ? readableTransferredNode(nodeContext, item) : null;
  };
  return {
    type: event[12 /* type */],
    bubbles: value(event[25 /* bubbles */]),
    cancelable: value(event[26 /* cancelable */]),
    cancelBubble: value(event[27 /* cancelBubble */]),
    defaultPrevented: value(event[29 /* defaultPrevented */]),
    eventPhase: value(event[30 /* eventPhase */]),
    isTrusted: value(event[31 /* isTrusted */]),
    returnValue: value(event[32 /* returnValue */]),
    currentTarget: value(event[28 /* currentTarget */]),
    target: value(event[13 /* target */]),
    scoped: value(event[34 /* scoped */]),
    keyCode: value(event[35 /* keyCode */])
  };
}
/**
 * @param nodeContext {NodeContext}
 * @param value {TransferrableSyncValue}
 */
function readableTransferrableSyncValue(nodeContext, value) {
  const index = value[7 /* index */];
  return {
    target: nodeContext.getNode(index) || index,
    value: value[21 /* value */]
  };
}
/**
 * @param message
 */
function readableMessageToWorker(nodeContext, message) {
  if (isEvent(message)) {
    const event = message[39 /* event */];
    return {
      type: 'EVENT',
      event: readableTransferrableEvent(nodeContext, event)
    };
  } else if (isValueSync(message)) {
    const sync = message[40 /* sync */];
    return {
      type: 'SYNC',
      sync: readableTransferrableSyncValue(nodeContext, sync)
    };
  } else if (isBoundingClientRect(message)) {
    return {
      type: 'GET_BOUNDING_CLIENT_RECT',
      target: readableTransferredNode(nodeContext, message[13 /* target */])
    };
  } else if (isGetStorage(message)) {
    return {
      type: 'GET_STORAGE',
      key: message[74 /* storageKey */],
      location: message[75 /* storageLocation */],
      value: message[21 /* value */]
    };
  } else {
    return 'Unrecognized MessageToWorker type: ' + message[12 /* type */];
  }
}

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}

/**
 * An almost drop-in replacement for a standard Web Worker, although this one
 * within a sandboxed cross-origin iframe for a heightened security boundary.
 * For more details on Worker, see: https://developer.mozilla.org/en-US/docs/Web/API/Worker
 *
 * The iframe used for sandboxing must follow a specific contract. It:
 *   1. Must send a ready message to the main-thread.
 *   2. Must listen for a message from main-thread with the code to initialize a Worker with.
 *   3. Must send "worker-ready" once worker is initialized.
 *   4. Must proxy all messages between the Worker and Parent, including errors.
 */
class IframeWorker {
  /**
   * @param url The URL to initiate the worker from.
   * @param iframeUrl The URL of the iframe to use as the worker proxy.
   */
  constructor(url, iframeUrl) {
    this.url = void 0;
    // Public Worker API
    this.onerror = void 0;
    this.onmessage = void 0;
    this.onmessageerror = void 0;
    this.readyPromise = void 0;
    // Internal variables.
    this.iframe = void 0;
    this.readyPromiseResolve = void 0;
    this.url = url;
    this.iframe = window.document.createElement('iframe');
    this.iframe.setAttribute('sandbox', 'allow-scripts');
    this.iframe.setAttribute('style', 'display:none');
    this.iframe.setAttribute('src', iframeUrl);
    this.url = url;
    this.readyPromise = new Promise(resolve => {
      this.readyPromiseResolve = resolve;
    });
    this.setupInit();
    this.proxyFromWorker();
    window.document.body.appendChild(this.iframe);
  }
  setupInit() {
    const listener = event => {
      if (event.source != this.iframe.contentWindow) {
        return;
      }
      fetch(this.url.toString()).then(res => res.text()).then(code => {
        const data = event.data;
        if (data.type == 'iframe-ready') {
          const msg = {
            type: 'init-worker',
            code
          };
          this.iframe.contentWindow.postMessage(msg, '*');
        } else if (data.type === 'worker-ready') {
          this.readyPromiseResolve();
          window.removeEventListener('message', listener);
        }
      });
    };
    window.addEventListener('message', listener);
  }
  proxyFromWorker() {
    window.addEventListener('message', event => {
      if (event.source != this.iframe.contentWindow) {
        return;
      }
      const {
        type,
        message
      } = event.data;
      if (type == 'onmessage' && this.onmessage) {
        this.onmessage(_extends({}, event, {
          data: message
        }));
      } else if (type === 'onerror' && this.onerror) {
        this.onerror(message);
      } else if (type === 'onmessageerror' && this.onmessageerror) {
        this.onmessageerror(_extends({}, event, {
          data: message
        }));
      }
    });
  }
  /**
   * See https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
   * @param message
   * @param transferables
   */
  postMessage(message, transferables) {
    const msg = {
      type: 'postMessage',
      message
    };
    this.readyPromise.then(() => {
      this.iframe.contentWindow.postMessage(msg, '*', transferables);
    });
  }
  /**
   * See https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate
   */
  terminate() {
    const msg = {
      type: 'terminate'
    };
    this.iframe.contentWindow.postMessage(msg, '*');
    this.iframe.remove();
  }
}

class WorkerContext {
  /**
   * @param baseElement
   * @param nodeContext
   * @param workerDOMScript
   * @param authorScript
   * @param config
   */
  constructor(baseElement, nodeContext, workerDOMScript, authorScript, config) {
    this[55 /* worker */] = void 0;
    this.nodeContext = void 0;
    this.config = void 0;
    this.nodeContext = nodeContext;
    this.config = config;
    const {
      skeleton,
      strings
    } = createHydrateableRootNode(baseElement, config, this);
    const cssKeys = [];
    const globalEventHandlerKeys = [];
    // TODO(choumx): Sync read of all localStorage and sessionStorage a possible performance bottleneck?
    const localStorageInit = getStorageInit('localStorage');
    const sessionStorageInit = getStorageInit('sessionStorage');
    for (const key in baseElement.style) {
      cssKeys.push(key);
    }
    for (const key in baseElement) {
      if (key.startsWith('on')) {
        globalEventHandlerKeys.push(key);
      }
    }
    // We skip assigning the globals for localStorage and sessionStorage because
    // We've already installed them. Also, accessing them can throw in incognito mode.
    const code = `'use strict';(function(){${workerDOMScript}self['window']=self;var workerDOM=WorkerThread.workerDOM;WorkerThread.hydrate(workerDOM.document,${JSON.stringify(strings)},${JSON.stringify(skeleton)},${JSON.stringify(cssKeys)},${JSON.stringify(globalEventHandlerKeys)},[${window.innerWidth},${window.innerHeight}],${JSON.stringify(localStorageInit)},${JSON.stringify(sessionStorageInit)});workerDOM.document[${59 /* observe */}](this);Object.assign(self,workerDOM);}).call(self);${authorScript}//# sourceURL=${encodeURI(config.authorURL)}`;
    if (!config.sandbox) {
      this[55 /* worker */] = new Worker(URL.createObjectURL(new Blob([code])));
    } else {
      this[55 /* worker */] = new IframeWorker(URL.createObjectURL(new Blob([code])), config.sandbox.iframeUrl);
    }
    {
      console.info('debug', 'hydratedNode', readableHydrateableRootNode(baseElement, config, this));
    }
    if (config.onCreateWorker) {
      config.onCreateWorker(baseElement, strings, skeleton, cssKeys);
    }
  }
  /**
   * Returns a Promise that resolves when the Worker is ready to receive messages.
   * @returns {Promise<void>}
   */
  ready() {
    return this.worker.readyPromise || Promise.resolve();
  }
  /**
   * Returns the private worker.
   */
  get worker() {
    return this[55 /* worker */];
  }
  /**
   * @param message
   */
  messageToWorker(message, transferables) {
    {
      console.info('debug', 'messageToWorker', readableMessageToWorker(this.nodeContext, message));
    }
    if (this.config.onSendMessage) {
      this.config.onSendMessage(message);
    }
    this.worker.postMessage(message, transferables || []);
  }
}
function getStorageInit(type, sanitizer) {
  try {
    if (!sanitizer) {
      return {
        storage: window[type],
        errorMsg: null
      };
    }
    return {
      storage: sanitizer.getStorage(type == 'localStorage' ? 0 /* Local */ : 1 /* Session */),
      errorMsg: null
    };
  } catch (err) {
    return {
      errorMsg: err.message,
      storage: null
    };
  }
}

/**
 * Stores objects that have their behavior handled from the main-thread. Each object is associated to a unique ID.
 */
class ObjectContext {
  constructor() {
    this.objects = void 0;
    this.objects = new Map();
  }
  store(id, obj) {
    this.objects.set(id, obj);
  }
  get(id) {
    const obj = this.objects.get(id);
    if (obj) {
      return obj;
    } else {
      throw new Error('Object with id (' + id + ') does not exist.');
    }
  }
}

/**
 * An ExportedWorker is returned by the upgradeElement API.
 * For the most part, it delegates to the underlying Worker.
 *
 * It notably removes `postMessage` support and adds `callFunction`.
 */
class ExportedWorker {
  constructor(workerContext, config) {
    this.workerContext_ = void 0;
    this.config = void 0;
    this.workerContext_ = workerContext;
    this.config = config;
  }
  /**
   * Calls a function in the worker and returns a promise with the result.
   * @param functionIdentifer
   * @param functionArguments
   */
  callFunction(functionIdentifer, ...functionArguments) {
    if (!this.config.executorsAllowed.includes(13 /* FUNCTION_CALL */)) {
      throw new Error(`[worker-dom]: Error calling ${functionIdentifer}. You must enable the FUNCTION_CALL executor within the config.`);
    }
    const {
      promise,
      index
    } = registerPromise();
    const msg = {
      [12 /* type */]: 12 /* FUNCTION */,
      [77 /* functionIdentifier */]: functionIdentifer,
      [78 /* functionArguments */]: JSON.stringify(functionArguments),
      [7 /* index */]: index
    };
    this.workerContext_.messageToWorker(msg);
    return promise;
  }
  set onerror(handler) {
    this.workerContext_.worker.onerror = handler;
  }
  terminate() {
    this.workerContext_.worker.terminate();
  }
}

const ALLOWABLE_MESSAGE_TYPES = [3 /* MUTATE */, 2 /* HYDRATE */];
/**
 * @param baseElement
 * @param authorScriptURL
 * @param workerDOMURL
 * @param callbacks
 * @param sanitizer
 * @param debug
 */
function fetchAndInstall(baseElement, config) {
  const fetchPromise = Promise.all([
  // TODO(KB): Fetch Polyfill for IE11.
  fetch(config.domURL).then(response => response.text()), fetch(config.authorURL).then(response => response.text())]);
  return install(fetchPromise, baseElement, config);
}
/**
 * @param fetchPromise
 * @param baseElement
 * @param config
 */
function install(fetchPromise, baseElement, config) {
  const mode = baseElement.dataset['shadowDom'];
  if (mode === 'open' || mode === 'closed') {
    const shadowRoot = baseElement.attachShadow({
      mode
    });
    const clonedElement = baseElement.cloneNode(true);
    shadowRoot.appendChild(clonedElement);
    baseElement = clonedElement;
  }
  const stringContext = new StringContext();
  const objectContext = new ObjectContext();
  const nodeContext = new NodeContext(stringContext, baseElement);
  const normalizedConfig = normalizeConfiguration(config);
  return fetchPromise.then(([domScriptContent, authorScriptContent]) => {
    if (domScriptContent && authorScriptContent && config.authorURL) {
      const workerContext = new WorkerContext(baseElement, nodeContext, domScriptContent, authorScriptContent, normalizedConfig);
      const mutatorContext = new MutatorProcessor(stringContext, nodeContext, workerContext, normalizedConfig, objectContext);
      workerContext.worker.onmessage = message => {
        const {
          data
        } = message;
        if (!ALLOWABLE_MESSAGE_TYPES.includes(data[12 /* type */])) {
          return;
        }
        mutatorContext.mutate(data[54 /* phase */], data[37 /* nodes */], data[41 /* strings */], new Uint16Array(data[36 /* mutations */]));
        if (config.onReceiveMessage) {
          config.onReceiveMessage(message);
        }
      };
      return workerContext.ready().then(() => new ExportedWorker(workerContext, normalizedConfig));
    }
    return null;
  });
}

const toLower = value => value.toLowerCase();

/**
 * @fileoverview This entry point API in active development and unstable.
 */
/**
 * AMP Element Children need to be filtered from Hydration, to avoid Author Code from manipulating it.
 * TODO: In the future, this contract needs to be more defined.
 * @param element
 */
const hydrateFilter = element => {
  if (element.parentNode !== null) {
    const lowerName = toLower(element.parentNode.localName || element.parentNode.nodeName);
    return !/amp-/.test(lowerName) || lowerName === 'amp-script';
  }
  return true;
};
/**
 * @param baseElement
 * @param domURL
 */
function upgradeElement(baseElement, domURL, longTask, sanitizer, sandbox) {
  const authorURL = baseElement.getAttribute('src');
  if (authorURL) {
    return fetchAndInstall(baseElement, {
      domURL,
      authorURL,
      longTask,
      hydrateFilter,
      sanitizer,
      sandbox
    });
  }
  return Promise.resolve(null);
}
/**
 * @param baseElement
 * @param fetchPromise Promise that resolves containing worker script, and author script.
 */
function upgrade(baseElement, fetchPromise, config) {
  config.hydrateFilter = hydrateFilter;
  return install(fetchPromise, baseElement, config);
}

export { upgrade, upgradeElement };
//# sourceMappingURL=main.mjs.map
