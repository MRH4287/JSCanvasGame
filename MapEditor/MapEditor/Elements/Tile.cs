using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.Elements
{
    /// <summary>
    /// The Tile Definition in the Map
    /// </summary>
    [DataContract]
    public class Tile
    {

        /// <summary>
        /// Constructor of the Tile-Class
        /// </summary>
        public Tile()
        {

        }

        /// <summary>
        /// Array of Element Definitions.
        /// </summary>
        private ElementDefinition[] children = new ElementDefinition[3];

        /// <summary>
        /// Gets or Sets the Elements for the Levels defined at <see cref="ElementLevel"/>
        /// </summary>
        /// <param name="level"></param>
        /// <returns></returns>
        public ElementDefinition this[ElementLevel level]
        {
            get
            {
                if (children == null)
                {
                    children = new ElementDefinition[3];
                }

                return children[(int)level];
            }
            set
            {
                if (children == null)
                {
                    children = new ElementDefinition[3];
                }

                children[(int)level] = value;

                switch (level)
                {
                    case ElementLevel.Bottom:
                        BottomElementID = (value != null) ? value.ID : "";
                        break;
                    case ElementLevel.Middle:
                        MiddleElementID = (value != null) ? value.ID : "";
                        break;
                    case ElementLevel.Top:
                        TopElementID = (value != null) ? value.ID : "";
                        break;
                    default:
                        break;
                }

                updatePassable();
            }
        }


        /// <summary>
        /// The Unique Identifier of this specific Tile.
        /// Used for Event-System 
        /// </summary>
        [DataMember(IsRequired = false)]
        public string ID = null;

        /// <summary>
        /// The Unique ID of the Element in the lowest Level
        /// </summary>
        [DataMember(IsRequired = false)]
        public string BottomElementID { get; private set; }

        /// <summary>
        /// The Unique ID of the Element in the middle Level
        /// </summary>
        [DataMember(IsRequired = false)]
        public string MiddleElementID { get; private set; }

        /// <summary>
        /// The Unique ID of the Element in the top Level
        /// </summary>
        [DataMember(IsRequired = false)]
        public string TopElementID { get; private set; }

        /// <summary>
        /// List of Flags for this specific Tile
        /// </summary>
        [DataMember(IsRequired = false)]
        public LinkedList<string> Flags = new LinkedList<string>();

        /// <summary>
        /// Defines if this Tile is passable by the Player
        /// </summary>
        [DataMember]
        public bool Passable = true;

        /// <summary>
        /// The Speed the Player walks on this specific Tile
        /// </summary>
        [DataMember(IsRequired = false)]
        public double Speed = 1.0;

        /// <summary>
        /// The Events fired by this Tile
        /// </summary>
        [DataMember(IsRequired=false)]
        public List<KeyValuePair<string, string>> Events = new List<KeyValuePair<string, string>>(0);


        /// <summary>
        /// Creates a new Tile-Instance from JSON
        /// </summary>
        /// <param name="JSON">JSON-String</param>
        /// <param name="elements">Element-Definitions</param>
        /// <returns>Tile-Instance</returns>
        /// 
        public static List<List<Tile>> Create(string JSON, Dictionary<string, ElementDefinition> elements)
        {
            var array = Data.JSON.JSONSerializer.deserialize<List<List<Tile>>>(JSON);

            for (int i = 0; i < array.Count; i++ )
            {
                for (int j = 0; j < array[i].Count; j++)
                {
                    array[i][j] = Create(array[i][j], elements);
                }
            }

            return array;

        }
        
        /// <summary>
        /// Updates an Tile Instance
        /// </summary>
        /// <param name="element">Element to Update</param>
        /// <param name="elements">Element-Definitions</param>
        /// <returns></returns>
        public static Tile Create(Tile element, Dictionary<string, ElementDefinition> elements = null)
        {
            try
            {

                if (elements != null)
                {
                    if (!String.IsNullOrWhiteSpace(element.BottomElementID))
                    {
                        element[ElementLevel.Bottom] = elements[element.BottomElementID];
                    }
                    if (!String.IsNullOrWhiteSpace(element.MiddleElementID))
                    {
                        element[ElementLevel.Middle] = elements[element.MiddleElementID];
                    }

                    if (!String.IsNullOrWhiteSpace(element.TopElementID))
                    {
                        element[ElementLevel.Top] = elements[element.TopElementID];
                    }
                }

                return element;
            }
            catch
            {
                return null;
            }

        }

        /// <summary>
        /// Updates the Passable Attribute
        /// </summary>
        private void updatePassable()
        {
            var passable = true;
            if (this[ElementLevel.Bottom] != null)
            {
                passable = passable && this[ElementLevel.Bottom].Passable;
            }
            if (this[ElementLevel.Middle] != null)
            {
                passable = passable && this[ElementLevel.Middle].Passable;
            }
            if (this[ElementLevel.Top] != null)
            {
                passable = passable && this[ElementLevel.Top].Passable;
            }


            this.Passable = passable;
        }

    }
}
