
let sampleApplet = `
class Box {
    constructor() {

    }
    onMount() {

    }
    render() {
        return nativeElement('box', this.props, this.styles, this.children)
    }
}
class Text {
    constructor() {

    }
    onMount() {

    }
    render() {
        return nativeElement('text', this.props, this.styles, [])
    }
}
class Button {
    constructor() {

    }
    onMount() {

    }
    render() {
        return nativeElement('button', this.props, this.styles, [])
    }
}
class Tabs {
    constructor() {

    }
    onMount() {

    }
    render() {
        return nativeElement('tabs', this.props, this.styles, this.children)
    }
}
class PrimaryTab {
    constructor() {

    }
    onMount() {

    }
    render() {
        return nativeElement('primary-tab', this.props, this.styles, this.children)
    }
}
class Test {
    constructor() {
        this.state = {
            total: 0,
            selectedCategoryId: 'pizza',
            menu: {
                pizza: [
                    {
                        id: 'pizza 1',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 16
                    },
                    {
                        id: 'pizza 2',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 32
                    },
                    {
                        id: 'pizza 3',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 16
                    },
                    {
                        id: 'pizza 4',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 32
                    },
                    {
                        id: 'pizza 5',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 16
                    },
                    {
                        id: 'pizza 6',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 32
                    }
                ],
                pasta: [
                    {
                        id: 'pasta 1',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 48
                    },
                    {
                        id: 'pasta 2',
                        description: 'bla bla bla',
                        tag: 'a tag ...',
                        count: 0,
                        price: 64
                    }
                ]
            }
        }
    }
    onMount() {

    }
    render() {
        return (
            <Box style={{
                width: 'calc(100% - 32px)', height: 'calc(100% - 32px)', backgroundColor: '#e3f2fd', borderRadius: 16, display: 'flex', flexWrap: 'wrap',
                background: 'linear-gradient(135deg,rgb(206, 147, 216),rgb(144, 202, 249)) border-box', padding: '20px 16px 8px 16px',
                boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'
            }}>
                <Box style={{width: 'calc(50% - 12px)', height: 'calc(50% - 12px)', position: 'relative', border: '1px solid #666', borderRadius: 16 }}>
                    <Text style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }} text={'1'} />
                </Box>
                <Box style={{ marginLeft: 16, width: 'calc(50% - 12px)', height: 'calc(50% - 12px)', position: 'relative', border: '1px solid #666', borderRadius: 16 }}>
                    <Text style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }} text={'2'} />
                </Box>
                <Box style={{width: 'calc(50% - 12px)', height: 'calc(50% - 12px)', position: 'relative', border: '1px solid #666', borderRadius: 16 }}>
                    <Text style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }} text={'3'} />
                </Box>
                <Box style={{ marginLeft: 16, width: 'calc(50% - 12px)', height: 'calc(50% - 12px)', position: 'relative', border: '1px solid #666', borderRadius: 16 }}>
                    <Text style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }} text={'4'} />
                </Box>
            </Box>
        )
    }
}
`

export default sampleApplet
