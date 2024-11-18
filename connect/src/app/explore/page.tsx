import ExploreTabs from '@/components/components/explore-tabs';
import PeopleList from '@/components/components/people-list';

export default function ExplorePage() {
    return (
        <div className="w-full h-full relative bg-content2">
            <PeopleList className="absolute top-4 pt-[112px]" people={[]}/>
            <ExploreTabs secondary style={{ position: 'absolute', top: 64 }} />
        </div>
    )
}
