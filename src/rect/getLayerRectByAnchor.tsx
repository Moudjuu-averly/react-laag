import { Direction, Primary, Side, AnchorEnum } from "../types";

import { splitAnchor, getPrimaryDirection } from "../anchor";

type LayerRectGetter = (args: {
  trigger: ClientRect;
  layer: ClientRect;
  primaryDirection: Direction;
  triggerOffset: number;
  offsetSecondary: number;
}) => Partial<ClientRect>;

const primaryLayerRectGetters: Record<Primary, LayerRectGetter> = {
  TOP: ({ trigger, layer, triggerOffset }) => {
    const bottom = trigger.top - triggerOffset;
    return {
      bottom,
      top: bottom - layer.height
    };
  },
  BOTTOM: ({ trigger, layer, triggerOffset }) => {
    const top = trigger.bottom + triggerOffset;

    return {
      top,
      bottom: top + layer.height
    };
  },
  LEFT: ({ trigger, layer, triggerOffset }) => {
    const right = trigger.left - triggerOffset;
    return {
      right,
      left: right - layer.width
    };
  },
  RIGHT: ({ trigger, layer, triggerOffset }) => {
    const left = trigger.right + triggerOffset;

    return {
      left,
      right: left + layer.width
    };
  }
};

const secondaryLayerRectGetters: Record<Side, LayerRectGetter> = {
  TOP: ({ trigger, layer, offsetSecondary }) => {
    const top = trigger.top + offsetSecondary;
    return {
      top,
      bottom: top + layer.height
    };
  },
  BOTTOM: ({ trigger, layer, offsetSecondary }) => {
    const bottom = trigger.bottom - offsetSecondary;

    return {
      bottom,
      top: bottom - layer.height
    };
  },
  LEFT: ({ trigger, layer, offsetSecondary }) => {
    const left = trigger.left + offsetSecondary;

    return {
      left,
      right: left + layer.width
    };
  },
  RIGHT: ({ trigger, layer, offsetSecondary }) => {
    const right = trigger.right - offsetSecondary;

    return {
      right,
      left: right - layer.width
    };
  },
  CENTER: ({ trigger, layer, primaryDirection, offsetSecondary }) => {
    if (primaryDirection === "Y") {
      const left =
        trigger.left + trigger.width / 2 - layer.width / 2 - offsetSecondary;
      return {
        left,
        right: left + layer.width
      };
    }

    const top =
      trigger.top + trigger.height / 2 - layer.height / 2 + offsetSecondary;
    return {
      top,
      bottom: top + layer.height
    };
  }
};

type GetLayerRectArgs = {
  trigger: ClientRect;
  layer: ClientRect;
  anchor: AnchorEnum;
  triggerOffset: number;
  scrollOffset?: number;
  offsetSecondary?: number;
};

export default function getLayerRectByAnchor({
  trigger,
  layer,
  anchor,
  triggerOffset,
  scrollOffset = 0,
  offsetSecondary = 0
}: GetLayerRectArgs): ClientRect {
  const { primary, secondary } = splitAnchor(anchor);

  const primaryDirection = getPrimaryDirection(anchor);

  const primaryRect = primaryLayerRectGetters[primary]({
    trigger,
    layer,
    primaryDirection,
    triggerOffset,
    offsetSecondary
  });
  const secondaryRect = secondaryLayerRectGetters[secondary]({
    trigger,
    layer,
    primaryDirection,
    triggerOffset,
    offsetSecondary
  });

  const result = {
    ...layer,
    ...primaryRect,
    ...secondaryRect,
    width: layer.width,
    height: layer.height
  };

  result.top = result.top - scrollOffset;
  result.right = result.right + scrollOffset;
  result.left = result.left - scrollOffset;
  result.bottom = result.bottom + scrollOffset;

  return result;
}