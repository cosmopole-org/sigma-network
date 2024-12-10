import { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent, Button } from "@nextui-org/react";
import Icon from "../elements/icon";
import { api } from "@/index";
import { States } from "@/api/client/states";
import { addWidgetToSDesktop } from "./desk";

export default function MachinesPalette() {

  const pos = States.useListener(States.store.currentPos);
  const edit = States.useListener(States.store.boardEditingMode);

  const [machines, setMachines] = useState<any[]>([]);
  useEffect(() => {
    api.sigma.services?.users.read({ typ: 'machine' }).then(res => {
      if (res.success && res.data?.users) setMachines(res.data?.users);
    });
  }, []);

  const content = (
    <PopoverContent className="w-[240px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <p className="text-small font-bold text-foreground" {...titleProps}>
            Machines
          </p>
          <div className="mt-2 flex flex-col gap-3 w-full">
            {
              machines.map(mac => {
                return (
                  <Button onPress={() => addWidgetToSDesktop(pos.spaceId, pos.topicId, mac.id)}>
                    <Icon name="bot" />
                    {mac.name}
                  </Button>
                )
              })
            }
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
            color="success"
            variant="shadow"
            className={"h-[40px] w-[auto] -translate-x-1/2 absolute left-1/2 bottom-[88px] " + (edit ? "translate-y-0" : "translate-y-[200px]")}
            radius="full"
          >
            <Icon name="add" />
            <Icon name="bot" />
          </Button>
        </PopoverTrigger>
        {content}
      </Popover>
    </div>
  );
}
