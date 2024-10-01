

const BiPanel = (props)=>{
    /*
    two panel layout, with the left most panel meant for UX controls
    */

    const renderChild = (idx:number) =>{
        if (props.children && props.children.length <= idx+1){
            return props.children[idx];
        } else {
            return <></>
        }
    }

    return (
        <div class="nfl-bipanel">
            <div class="panel-1">{renderChild(0)}</div>
            <div class="panel-2">{renderChild(1)}</div>
        </div>
    )

}

export default BiPanel;