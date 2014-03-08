using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.Elements
{

    [DataContract()]
    public class AnimationElement
    {
        [DataMember()]
        public string ID { get; set; }

        [DataMember()]
        public string ImageURI { get; set; }

        [DataMember()]
        public ObservableCollection<Animation> Animations { get; set; }
    }


    [DataContract()]
    public class Animation : ICloneable
    {
        [DataMember()]
        public string ID { get; set; }

        [DataMember()]
        public int ImageCount { get; set; }

        [DataMember()]
        public int StartX { get; set; }

        [DataMember()]
        public int StartY { get; set; }

        [DataMember()]
        public int ImageHeight { get; set; }

        [DataMember()]
        public int ImageWidth { get; set; }

        [DataMember()]
        public double DisplayHeight { get; set; }

        [DataMember()]
        public double DisplayWidth { get; set; }

        [DataMember()]
        public int OffsetX { get; set; }

        [DataMember()]
        public int OffsetY { get; set; }

        [DataMember()]
        public double DisplayOffsetX { get; set; }

        [DataMember()]
        public double DisplayOffsetY { get; set; }

        [DataMember()]
        public int Speed { get; set; }

        [DataMember()]
        public bool ReverseOnEnd { get; set; }

        [DataMember()]
        public bool IsReverse { get; set; }

        [DataMember()]
        public bool Loop { get; set; }

        [DataMember()]
        public int AnimationState { get; set; }

        [DataMember()]
        public string AnimationGroup { get; set; }


        public object Clone()
        {
            return new Animation()
            {
                ID = "ClonedElement",
                ImageCount = this.ImageCount,
                StartX = this.StartX,
                StartY = this.StartY,
                ImageHeight = this.ImageHeight,
                ImageWidth = this.ImageWidth,
                DisplayHeight = this.DisplayHeight,
                DisplayWidth = this.DisplayWidth,
                OffsetX = this.OffsetX,
                OffsetY = this.OffsetY,
                DisplayOffsetX = this.DisplayOffsetX,
                DisplayOffsetY = this.DisplayOffsetY,
                Speed = this.Speed,
                ReverseOnEnd = this.ReverseOnEnd,
                IsReverse = this.IsReverse,
                Loop = this.Loop,
                AnimationState = this.AnimationState,
                AnimationGroup = this.AnimationGroup
            };
        }
    }
}
