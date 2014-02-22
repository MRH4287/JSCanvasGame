interface Event
{
    name: string;
    callbacks: () => void[];
}

class EventHandler
{
    private events: { [id: string]: Event} = {};

    private test()
    {
        
    }

}