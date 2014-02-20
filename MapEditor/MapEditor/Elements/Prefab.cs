using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.Elements
{

    /// <summary>
    /// Predefined Structure used to draw
    /// </summary>
    [DataContract]
    class Prefab
    {
        /// <summary>
        /// The unique ID of that Prefab
        /// </summary>
        [DataMember]
        public string ID { get; set; }

        /// <summary>
        /// The Path to the Preview Image
        /// </summary>
        [DataMember]
        public string PreviewImagePath { get; set; }

        /// <summary>
        /// The absolute URI to the Preview Image
        /// </summary>
        public Uri PreviewImageUri
        {
            get
            {
                if (PreviewImagePath == null)
                {
                    return null;
                }

                return MapController.GetAbsoluteUri(this.PreviewImagePath);
            }
        }

        /// <summary>
        /// Collection of Elements in that Prefab
        /// </summary>
        [DataMember]
        public List<PrefabElement> Elements { get; set; }

        /// <summary>
        /// Overwrite existing Elements
        /// </summary>
        [DataMember(IsRequired=false)]
        public bool Overwrite = true;

        /// <summary>
        /// Clear tiles before new Data is applied
        /// </summary>
        [DataMember(IsRequired=false)]
        public bool ClearOld = false;


        /// <summary>
        /// Initializes the Prefab Instance
        /// </summary>
        /// <param name="elements">List Of Element Definitions</param>
        public void Init(Dictionary<string, ElementDefinition> elements)
        {
            foreach (var element in Elements)
            {
                if (element.Tile != null)
                {
                    element.Tile = Tile.Create(element.Tile, elements);
                }
            }
        }

        /// <summary>
        /// Creates a new Prefab Instance from JSON
        /// </summary>
        /// <param name="JSON">JSON Input</param>
        /// <param name="elements">List of Element Definition</param>
        /// <returns>Prefab Instance</returns>
        public static Prefab Create(string JSON, Dictionary<string, ElementDefinition> elements)
        {
            var instance =Data.JSON.JSONSerializer.deserialize<Prefab>(JSON);

            instance.Init(elements);

            return instance;
        }

    }

    /// <summary>
    /// Element that should be placed to the Map
    /// </summary>
    [DataContract]
    class PrefabElement
    {
        /// <summary>
        /// The X Offset from the Clicked Position 
        /// </summary>
        [DataMember]
        public int OffsetX { get; set; }

        /// <summary>
        /// The Y Offset from the Clicked Position 
        /// </summary>
        [DataMember]
        public int OffsetY { get; set; }

        /// <summary>
        /// The Tile that is set to the Field
        /// </summary>
        [DataMember]
        public Tile Tile { get; set; }
    }
}
