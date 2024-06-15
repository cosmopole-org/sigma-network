
use std::any::{Any, TypeId};
use std::cmp::Eq;
use std::collections::HashMap;
use std::hash::Hash;
 
type HashKey<K> = (K, TypeId);
type Anything = Box<dyn Any>;
 
#[derive(Debug)]
pub struct AnyMap<K: Eq + Hash>(HashMap<HashKey<K>, Anything>);
 
impl<K: Eq + Hash> AnyMap<K> {
    /// Creates a new hashmap that can store
    /// any data which can be tagged with the
    /// `Any` trait.
    pub fn new() -> Self {
        Self(HashMap::new())
    }
 
    /// Creates a new hashmap that can store
    /// at least the capacity given.
    pub fn new_with_capacity(capacity: usize) -> Self {
        Self(HashMap::with_capacity(capacity))
    }
 
    /// Inserts the provided value under the key.  Keys
    /// are tracked with their type; meaning you can
    /// have the same key used multiple times with different
    /// values.
    ///
    /// If the storage had a value of the type being stored
    /// under the same key it is returned.
    pub fn insert<V: Any>(&mut self, key: K, val: V) -> Option<V> {
        let boxed = self
            .0
            .insert((key, val.type_id()), Box::new(val))?
            .downcast::<V>()
            .ok()?;
 
        Some(Box::into_inner(boxed))
    }
 
    /// Fetch a reference for the type given under a
    /// given key.  Note that the key needs to be provided
    /// with ownership.  This may change in the future if
    /// I can figure out how to only borrow the key for
    /// comparison.
    pub fn get<V: Any>(&self, key: K) -> Option<&V> {
        self.0.get(&(key, TypeId::of::<V>()))?.downcast_ref::<V>()
    }
 
    /// A mutable reference for the type given under
    /// a given key.  Note that the key needs to be provided
    /// with ownership.
    pub fn get_mut<V: Any>(&mut self, key: K) -> Option<&mut V> {
        self.0
            .get_mut(&(key, TypeId::of::<V>()))?
            .downcast_mut::<V>()
    }
 
    /// Removes the data of the given type under they key
    /// if it's found.  The data found is returned in an
    /// Option after it's removed.
    pub fn remove<V: Any>(&mut self, key: K) -> Option<V> {
        let boxed = self
            .0
            .remove(&(key, TypeId::of::<V>()))?
            .downcast::<V>()
            .ok()?;
 
        Some(Box::into_inner(boxed))
    }
}
