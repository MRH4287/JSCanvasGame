using MapEditor.GUIElements;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MapEditor.Elements
{
    /// <summary>
    /// Definition of an Element
    /// </summary>
    [DataContract]
    public class ElementDefinition
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
        public string ID { get; set; }

        /// <summary>
        /// The Name of this Element
        /// </summary>
        [DataMember]
        public string Name { get; set; }

        /// <summary>
        /// Is this Item Passable by the Player
        /// </summary>
        [DataMember]
        public bool Passable = true;

        /// <summary>
        /// The Level of the Element
        /// </summary>
        [DataMember(IsRequired = false)]
        public ElementLevel Level = ElementLevel.Bottom;

        /// <summary>
        /// The walking Speed of the Player
        /// </summary>
        [DataMember(IsRequired = false)]
        public double Speed = 1.0;

        /// <summary>
        /// The Flags for this Element
        /// </summary>
        [DataMember(IsRequired = false)]
        public ObservableCollection<String> Flags = new ObservableCollection<string>();

        /// <summary>
        /// The Path to the Image File
        /// </summary>
        [DataMember]
        public string ImageURI { get; set; }

        /// <summary>
        /// The Events fired by this Tile
        /// </summary>
        [DataMember(IsRequired = false)]
        public List<KeyValuePair<string, string>> Events = null;

        /// <summary>
        /// Is this Element Dynamic? Does it contains animations.
        /// </summary>
        [DataMember(IsRequired = false)]
        public bool Dynamic = false;

        /// <summary>
        /// The Path to the Definition of the Animation File
        /// </summary>
        [DataMember(IsRequired = false)]
        public string AnimationDefinition { get; set; }

        /// <summary>
        /// The name of the Animation Container
        /// </summary>
        [DataMember(IsRequired = false)]
        public string AnimationContainer { get; set; }

        /// <summary>
        /// The default Animation to play
        /// </summary>
        [DataMember(IsRequired = false)]
        public string DefaultAnimation { get; set; }

        /// <summary>
        /// The Uri Instance to the Image
        /// </summary>
        public Uri ImagePath
        {
            get
            {
                return MapController.GetAbsoluteUri(ImageURI);
            }
        }

        /// <summary>
        /// Image Source
        /// </summary>
        public ImageSource ImageSource
        {
            get
            {
                if (File.Exists(ImagePath.LocalPath))
                {
                    return new BitmapImage(ImagePath);
                }
                else
                {
                    return null;
                }
            }

        }

        /// <summary>
        /// Creates an Instance from a JSON-String
        /// </summary>
        /// <param name="JSON">Serialized Element Definition</param>
        /// <returns>ElementDefinition</returns>
        public static List<ElementDefinition> Create(string JSON)
        {
            return Data.JSON.JSONSerializer.deserialize<List<ElementDefinition>>(JSON);

        }

    }
}
