import { Button, Card } from "@nextui-org/react";
import React from "react";
import { DrawerItemProps } from "@/types";
import Icon from "./icon";

export default function Drawer({ items, open, onOpenStateChange }: Readonly<{ items?: DrawerItemProps[], open?: boolean, onOpenStateChange?: (open: boolean) => void }>) {
  return (
    <Card className={(open ? 'w-72' : 'w-20') + ` h-full rounded-none pl-[14px] pr-[14px] pt-5 gap-4 fixed`}
      style={{ backgroundColor: '#581c87', transition: 'width 250ms' }}>
      <Button size="lg" className={open ? 'ml-[100px] mb-4 bg-white' : 'mb-4 bg-white'} isIconOnly onPress={() => {
        if (onOpenStateChange) onOpenStateChange(!open)
      }}>
        <Icon name="asqme-logo" />
      </Button>
      {
        items ?
          items.map(item => {
            const isFilled = item.variant === "filled";
            return (
              <Button size="lg" key={item.key} isIconOnly={!open} className={isFilled ? 'mb-2 bg-white' : 'bg-transparent'}>
                <Icon color={isFilled ? '#000000' : '#ffffff'} name={item.icon ?? ""} size={[28, 28]} iconType={item.iconType} />
                <div className={"flex flex-col " + ((isFilled || !open) ? 'text-center ' : 'flex-1 text-left ')}>
                  <span
                    className={((isFilled || !open) ? 'text-center ' : 'flex-1 text-left ')}
                    style={{ color: isFilled ? '#000' : '#fff' }}>
                    {open ? item.title : null}
                  </span>
                  {open ? <span className="text-sm text-default-400 text-left">{item.subtitle}</span> : null}
                </div>
              </Button>
            )
          }) :
          null
      }
    </Card>
  )
}
