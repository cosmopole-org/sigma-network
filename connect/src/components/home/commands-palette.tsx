import React from "react";
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import Icon from "../elements/icon";

export default function CommandsPalette() {

  const content = (
    <PopoverContent className="w-[240px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <p className="text-small font-bold text-foreground" {...titleProps}>
            Commands
          </p>
          <div className="mt-2 flex flex-col gap-3 w-full">
            <Button>
              <Icon name="command" />
              Turn lights on
            </Button>
            <Button>
              <Icon name="command" />
              Open Gate
            </Button>
            <Button>
              <Icon name="command" />
              Switcn Temperature
            </Button>
          </div>
        </div>
      )}
    </PopoverContent>
  )

  return (
    <div className="flex flex-wrap">
      <Popover
        showArrow
        offset={20}
        placement="bottom"
        backdrop={"blur"}
      >
        <PopoverTrigger>
          <Button
            isIconOnly
            variant="shadow"
            color="secondary"
            className="h-12 w-12"
            radius="lg"
          >
            <Icon name="command" />
          </Button>
        </PopoverTrigger>
        {content}
      </Popover>
    </div>
  );
}
