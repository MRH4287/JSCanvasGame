using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace MapEditor.GUIElements.Base
{
    abstract class Selectable : ContentControl, INotifyPropertyChanged
    {
        #region Dependencie Properties


        public static Visibility GetSelectionIndicatorVisible(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(SelectionIndicatorVisibleProperty);
        }

        public static void SetSelectionIndicatorVisible(DependencyObject obj, Visibility value)
        {
            obj.SetValue(SelectionIndicatorVisibleProperty, value);
        }

        // Using a DependencyProperty as the backing store for SelectionIndicatorVisible.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty SelectionIndicatorVisibleProperty =
            DependencyProperty.RegisterAttached("SelectionIndicatorVisible", typeof(Visibility), typeof(Selectable), new PropertyMetadata(Visibility.Collapsed));


        public bool Selected
        {
            get
            {
                return (GetSelectionIndicatorVisible(this) == System.Windows.Visibility.Visible);
            }
            set
            {
                SetSelectionIndicatorVisible(this, (value) ? Visibility.Visible : Visibility.Collapsed);
            }
        }

        #endregion


        public Selectable()
            : base()
        {

        }


        protected void triggerPropertyChanged(string Property)
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(Property));
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
    }
}
