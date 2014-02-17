using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.Elements
{
    /// <summary>
    /// Definition of an Element
    /// </summary>
    [DataContract]
    class ElementDefinition
    {
        /// <summary>
        /// Constructor of the Element
        /// </summary>
        public ElementDefinition()
        {

        }

        /// <summary>
        /// The Unique Identifier for this Element
        /// </summary>
        [DataMember]
        public string ID;

        /// <summary>
        /// The Name of this Element
        /// </summary>
        [DataMember]
        public string Name;

        /// <summary>
        /// Is this Item Passable by the Player
        /// </summary>
        [DataMember]
        public bool Passable = true;

        /// <summary>
        /// The walking Speed of the Player
        /// </summary>
        [DataMember(IsRequired = false)]
        public double Speed = 1.0;

        /// <summary>
        /// The Flags for this Element
        /// </summary>
        [DataMember(IsRequired=false)]
        public LinkedList<String> Flags = new LinkedList<string>();

        /// <summary>
        /// The Path to the Image File
        /// </summary>
        [DataMember]
        public string ImageURI;

        /// <summary>
        /// Creates an Instance from a JSON-String
        /// </summary>
        /// <param name="JSON">Serialized Element Definition</param>
        /// <returns>ElementDefinition</returns>
        public static List<ElementDefinition> Create(string JSON)
        {
            try
            {
                return Data.JSON.JSONSerializer.deserialize <List<ElementDefinition>>(JSON);
            }
            catch
            {
                return null;
            }

        }

    }
}
