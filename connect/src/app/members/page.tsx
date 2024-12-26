import { Button } from "@nextui-org/react";
import Icon from "@/components/elements/icon";
import ContactCreateModal, { switchContactCreateModal } from "@/components/home/contact-create-modal";
import { Navbar, NavbarContent } from "@nextui-org/navbar";
import HomeSearchbar from "@/components/home/home-searchbar";
import PeopleList from "@/components/components/people-list";
import { useEffect, useRef, useState } from "react";
import { api } from "@/index";
import { Member, MemberUser, User } from "@/api/sigma/models";

export default function MembersPage({ spaceId }: Readonly<{ spaceId: string }>) {
    const userCache = useRef<{ [id: string]: User }>({});
    const [members, setMembers] = useState<MemberUser[]>([]);
    useEffect(() => {
        const membersObservable = api.sigma.store.db.members.find({
            selector: {
                spaceId: spaceId
            }
        }).$;
        let spacesSub = membersObservable.subscribe((ss: Member[]) => {
            let mUsers: MemberUser[] = [];
            let promises: Promise<User | undefined>[] = [];
            ss.forEach(m => {
                if (!userCache.current[m.id]) {
                    promises.push((async () => {
                        let res = await api.sigma.services?.users.get({ userId: m.userId });
                        let user = res?.data?.user;
                        if (user && user.type === "human") {
                            userCache.current[user.id] = user;
                        }
                        return res?.data?.user;
                    })());
                }
            });
            Promise.all(promises).then(() => {
                ss.forEach(m => {
                    if (userCache.current[m.userId]) {
                        mUsers.push({ member: m, user: userCache.current[m.userId] } as MemberUser);
                    }
                })
                setMembers(mUsers);
            });
        });
        api.sigma.services?.spaces.readMembers({ spaceId });
        return () => {
            spacesSub.unsubscribe();
        }
    }, [spaceId]);
    return (
        <div className="w-full h-full relative overflow-y-auto bg-white dark:bg-content1">
            <Navbar
                isBlurred
                isBordered
                className={'pt-10 pb-3'}
            >
                <NavbarContent as="div" className={"items-center w-full"} justify="center">
                    <div className={"w-full"}>
                        <HomeSearchbar />
                    </div>
                </NavbarContent>
            </Navbar >
            <PeopleList className="absolute top-6 pt-[112px]" people={members} />
            <Button
                color="primary"
                variant="shadow"
                className="fixed bottom-4 left-1/2 -translate-x-1/2 h-10 text-lg"
                radius="full"
                style={{ zIndex: 10 }}
                onPress={() => switchContactCreateModal(true)}
            >
                <Icon name="add" />
                Create new contact
            </Button>
            <ContactCreateModal />
        </div>
    )
}
