import MachinesList from '@/components/home/machines-list';

export default function RoomMachinesPage() {
    return (
        <div className="w-full h-full relative bg-white dark:bg-content1">
            <MachinesList className='absolute pt-16 top-0' />
        </div>
    )
}
