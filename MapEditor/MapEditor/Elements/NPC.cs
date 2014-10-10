using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;

namespace MapEditor.Elements
{
    [DataContract]
    public class NPC
    {

        [DataMember]
        public string ID = null;

        [DataMember]
        public string Name = null;

        [DataMember]
        public string AnimationContainer = null;

        [DataMember]
        public string DefaultAnimation = null;

        [DataMember]
        public double Speed = 0;

        [DataMember(IsRequired = false)]
        public string Script = null;

        [DataMember]
        public string PreviewImagePath = null;

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

    }
}
