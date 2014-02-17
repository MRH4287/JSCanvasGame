using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.Elements
{
    /// <summary>
    /// Events used in the Game
    /// </summary>
    enum Events
    {
        /// <summary>
        /// Player walked over Tile
        /// </summary>
        OnWalkOver,
        /// <summary>
        /// Player used Tile
        /// </summary>
        OnUse,
        /// <summary>
        /// Every World-Tick
        /// </summary>
        OnTick,
        /// <summary>
        /// Fires after the Element has been drawn
        /// </summary>
        OnDraw,
        /// <summary>
        /// Fires when Element was Removed
        /// </summary>
        OnRemove
    }
}
